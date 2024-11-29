const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const finnhub = require('finnhub');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB_API_KEY;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const finnhubClient = new finnhub.DefaultApi();

const db = new sqlite3.Database('./banco.db', (err) => {
    if (err) {
        console.error('Erro ao conectar banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados.');
    }
});

db.serialize(() => {
    db.all("PRAGMA table_info(users);", (err, columns) => {
        if (err) {
            console.error('Erro ao obter informações da tabela:', err.message);
        } else {
            const columnNames = columns.map(col => col.name);
            if (!columnNames.includes('saldo')) {
                db.run('ALTER TABLE users ADD COLUMN saldo REAL DEFAULT 0', (err) => {
                    if (err) {
                        console.error('Erro ao adicionar a coluna saldo:', err.message);
                    } else {
                        console.log('Coluna saldo adicionada com sucesso.');
                    }
                });
            } else {
                console.log('A coluna saldo já existe.');
            }
            if (!columnNames.includes('googleId')) {
                db.run('ALTER TABLE users ADD COLUMN googleId TEXT UNIQUE', (err) => {
                    if (err) {
                        console.error('Erro ao adicionar a coluna googleId:', err.message);
                    } else {
                        console.log('Coluna googleId adicionada com sucesso.');
                    }
                });
            } else {
                console.log('A coluna googleId já existe.');
            }
        }
    });
});

db.run(`CREATE TABLE IF NOT EXISTS user_acoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    simbolo TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_compra REAL NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) {
        console.error('Erro ao criar a tabela user_acoes:', err.message);
    } else {
        console.log('Tabela user_acoes pronta.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    simbolo TEXT NOT NULL,
    target_price REAL NOT NULL,
    triggered INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) {
        console.error('Erro ao criar a tabela alerts:', err.message);
    } else {
        console.log('Tabela alerts pronta.');
    }
});

const dbGet = promisify(db.get).bind(db);
const dbRun = promisify(db.run).bind(db);

async function createUser(user) {
    const { googleId, email, name, profilePicture } = user;
    const existingUser = await findUserByGoogleId(googleId);
    if (existingUser) {
        throw new Error('Usuário com este googleId já existe.');
    }
    await dbRun(
        'INSERT INTO users (googleId, email, nome, profilePicture) VALUES (?, ?, ?, ?)',
        [googleId, email, name, profilePicture]
    );
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('❌ Token não fornecido.');
        return res.status(401).json({ error: 'Token não fornecido.' });
    }
    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            console.log('❌ Token inválido.');
            return res.status(403).json({ error: 'Token inválido.' });
        }
        console.log(`🔑 Token verificado para userId: ${user.id}`);
        req.userId = user.id;
        next();
    });
}

async function findUserByGoogleId(googleId) {
    return await dbGet('SELECT * FROM users WHERE googleId = ?', [googleId]);
}


app.post('/register', async (req, res) => {
    const { email, senha, nome, cpf, telefone, cep } = req.body;
    try {
        const cpfExists = await dbGet('SELECT * FROM users WHERE cpf = ?', [cpf]);
        if (cpfExists) {
            return res.status(400).json({ error: 'CPF já está em uso.' });
        }
        const emailExists = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (emailExists) {
            return res.status(400).json({ error: 'E-mail já está em uso.' });
        }
        const hashedSenha = await bcrypt.hash(senha, 10);
        await dbRun(
            'INSERT INTO users (email, senha, nome, cpf, telefone, cep) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedSenha, nome, cpf, telefone, cep]
        );
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ error: 'Erro no servidor.', details: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (!usuario) {
            return res.status(400).json({ error: 'Usuário não encontrado.' });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({ error: 'Senha incorreta.' });
        }
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            'secret_key',
            { expiresIn: '1h' }
        );
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

app.get('/saldo', authenticateToken, async (req, res) => {
    console.log(`Recebida requisição de saldo para userId: ${req.userId}`);
    try {
        const usuario = await dbGet('SELECT saldo FROM users WHERE id = ?', [req.userId]);
        if (!usuario) {
            console.log('Usuário não encontrado.');
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        console.log(`Saldo encontrado: ${usuario.saldo}`);
        res.json({ saldo: usuario.saldo });
    } catch (error) {
        console.error('Erro ao obter saldo:', error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

app.post('/deposito', authenticateToken, async (req, res) => {
    const { valor } = req.body;
    console.log(`Recebido depósito: valor = ${valor}, userId = ${req.userId}`);
    if (!valor || valor <= 0) {
        return res.status(400).json({ error: 'Valor de depósito inválido.' });
    }
    try {
        await dbRun('UPDATE users SET saldo = saldo + ? WHERE id = ?', [valor, req.userId]);
        const usuario = await dbGet('SELECT saldo FROM users WHERE id = ?', [req.userId]);
        console.log(`Depósito realizado com sucesso: novo saldo = ${usuario.saldo}`);
        res.json({ message: 'Depósito realizado com sucesso!', saldo: usuario.saldo });
    } catch (error) {
        console.error('Erro ao realizar depósito:', error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

app.post('/saque', authenticateToken, async (req, res) => {
    const { valor } = req.body;
    console.log(`💸 Saque solicitado: valor = ${valor}, userId = ${req.userId}`);
    if (valor === undefined) {
        console.log('❌ Erro: Campo "valor" não fornecido.');
        return res.status(400).json({ error: 'O campo "valor" é obrigatório.' });
    }
    const valorSaque = parseFloat(valor);
    if (isNaN(valorSaque) || valorSaque <= 0) {
        console.log('❌ Erro: Valor do saque inválido.');
        return res.status(400).json({ error: 'O valor do saque deve ser um número positivo.' });
    }
    try {
        const usuario = await dbGet('SELECT saldo FROM users WHERE id = ?', [req.userId]);
        console.log(`🔍 Saldo atual do usuário (ID: ${req.userId}): ${usuario ? usuario.saldo : 'Não encontrado'}`);
        if (!usuario) {
            console.log('❌ Erro: Usuário não encontrado.');
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (valorSaque > usuario.saldo) {
            console.log('❌ Erro: Saldo insuficiente para saque.');
            return res.status(400).json({ error: 'Saldo insuficiente para realizar o saque.' });
        }
        await dbRun('UPDATE users SET saldo = saldo - ? WHERE id = ?', [valorSaque, req.userId]);
        console.log(`✅ Saque realizado: R$ ${valorSaque}, userId: ${req.userId}`);
        const novoSaldo = await dbGet('SELECT saldo FROM users WHERE id = ?', [req.userId]);
        console.log(`💰 Novo saldo para userId ${req.userId}: R$ ${novoSaldo.saldo}`);
        res.json({
            message: 'Saque realizado com sucesso!',
            saldo: novoSaldo.saldo
        });
    } catch (error) {
        console.error('⚠️ Erro ao realizar saque:', error);
        res.status(500).json({ error: 'Erro no servidor ao realizar o saque.' });
    }
});

app.get('/stock-prices', async (req, res) => {
    const symbols = req.query.symbols.split(',');
    try {
        const quotes = await Promise.all(symbols.map(symbol => {
            return new Promise((resolve, reject) => {
                finnhubClient.quote(symbol, (error, data, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ symbol, ...data });
                    }
                });
            });
        }));
        res.json(quotes);
    } catch (error) {
        res.status(500).send('Erro ao buscar preços das ações');
    }
});

app.post('/comprar', authenticateToken, async (req, res) => {
    const { simbolo, quantidade } = req.body;
    const userId = req.userId;
    if (!simbolo || !quantidade || quantidade <= 0) {
        return res.status(400).json({ error: 'Simbolo e quantidade válidos são necessários.' });
    }
    try {
        const response = await fetch(`https://seu-endereco.ngrok.io/stock-prices?symbols=${simbolo}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao obter preço da ação.');
        }
        const data = await response.json();
        if (data.length === 0 || !data[0].c) {
            throw new Error('Preço da ação não encontrado.');
        }
        const precoAtual = data[0].c;
        const totalCompra = quantidade * precoAtual;
        const usuario = await dbGet('SELECT saldo FROM users WHERE id = ?', [userId]);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (usuario.saldo < totalCompra) {
            return res.status(400).json({ error: 'Saldo insuficiente para realizar a compra.' });
        }
        const acaoExistente = await dbGet('SELECT * FROM user_acoes WHERE user_id = ? AND simbolo = ?', [userId, simbolo]);
        if (acaoExistente) {
            const novaQuantidade = acaoExistente.quantidade + quantidade;
            const novoPrecoCompra = ((acaoExistente.quantidade * acaoExistente.preco_compra) + (quantidade * precoAtual)) / novaQuantidade;
            await dbRun(
                'UPDATE user_acoes SET quantidade = ?, preco_compra = ? WHERE id = ?',
                [novaQuantidade, novoPrecoCompra, acaoExistente.id]
            );
        } else {
            await dbRun(
                'INSERT INTO user_acoes (user_id, simbolo, quantidade, preco_compra) VALUES (?, ?, ?, ?)',
                [userId, simbolo, quantidade, precoAtual]
            );
        }
        await dbRun('UPDATE users SET saldo = saldo - ? WHERE id = ?', [totalCompra, userId]);
        const novoSaldo = await dbGet('SELECT saldo FROM users WHERE id = ?', [userId]);
        res.json({ message: `Compradas ${quantidade} ações de ${simbolo} por R$ ${precoAtual.toFixed(2)} cada.`, saldo: novoSaldo.saldo });
    } catch (error) {
        console.error('Erro ao comprar ação:', error);
        res.status(500).json({ error: error.message || 'Erro ao realizar a compra.' });
    }
});

app.get('/minhas-acoes', authenticateToken, async (req, res) => {
    const userId = req.userId;
    try {
        const acoes = await new Promise((resolve, reject) => {
            db.all(
                'SELECT id, simbolo, quantidade, preco_compra, data_compra FROM user_acoes WHERE user_id = ?',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
        res.json({ acoes });
    } catch (error) {
        console.error('Erro ao obter ações do usuário:', error);
        res.status(500).json({ error: 'Erro ao obter ações do usuário.' });
    }
});

app.post('/vender', authenticateToken, async (req, res) => {
    const { simbolo, quantidade } = req.body;
    const userId = req.userId;
    if (!simbolo || !quantidade || quantidade <= 0) {
        return res.status(400).json({ error: 'Símbolo e quantidade válidos são necessários.' });
    }
    try {
        const acaoExistente = await dbGet(
            'SELECT * FROM user_acoes WHERE user_id = ? AND simbolo = ?',
            [userId, simbolo]
        );
        if (!acaoExistente || acaoExistente.quantidade < quantidade) {
            return res.status(400).json({ error: 'Quantidade insuficiente de ações para venda.' });
        }
        const response = await fetch(
            `https://seu-endereco.ngrok.io/stock-prices?symbols=${simbolo}`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao obter preço da ação.');
        }
        const data = await response.json();
        if (data.length === 0 || !data[0].c) {
            throw new Error('Preço da ação não encontrado.');
        }
        const precoAtual = data[0].c;
        const totalVenda = quantidade * precoAtual;
        const novaQuantidade = acaoExistente.quantidade - quantidade;
        if (novaQuantidade > 0) {
            await dbRun(
                'UPDATE user_acoes SET quantidade = ? WHERE id = ?',
                [novaQuantidade, acaoExistente.id]
            );
        } else {
            await dbRun('DELETE FROM user_acoes WHERE id = ?', [acaoExistente.id]);
        }
        await dbRun('UPDATE users SET saldo = saldo + ? WHERE id = ?', [totalVenda, userId]);
        const novoSaldo = await dbGet('SELECT saldo FROM users WHERE id = ?', [userId]);
        res.json({
            message: `Vendidas ${quantidade} ações de ${simbolo} por R$ ${precoAtual.toFixed(2)} cada.`,
            saldo: novoSaldo.saldo,
        });
    } catch (error) {
        console.error('Erro ao vender ação:', error);
        res.status(500).json({ error: error.message || 'Erro ao realizar a venda.' });
    }
});

app.post('/alerts', authenticateToken, async (req, res) => {
    const { simbolo, target_price } = req.body;
    const userId = req.userId;
    if (!simbolo || !target_price || target_price <= 0) {
        return res.status(400).json({ error: 'Símbolo e preço-alvo válidos são necessários.' });
    }
    try {
        await dbRun(
            'INSERT INTO alerts (user_id, simbolo, target_price) VALUES (?, ?, ?)',
            [userId, simbolo, target_price]
        );
        res.status(201).json({ message: 'Alerta criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar alerta:', error);
        res.status(500).json({ error: 'Erro ao criar alerta.' });
    }
});

app.get('/alerts', authenticateToken, async (req, res) => {
    const userId = req.userId;
    try {
        const alerts = await new Promise((resolve, reject) => {
            db.all(
                'SELECT id, simbolo, target_price, triggered FROM alerts WHERE user_id = ?',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
        res.json({ alerts });
    } catch (error) {
        console.error('Erro ao listar alertas:', error);
        res.status(500).json({ error: 'Erro ao listar alertas.' });
    }
});

app.delete('/alerts/:id', authenticateToken, async (req, res) => {
    const userId = req.userId;
    const alertId = req.params.id;
    try {
        const alert = await dbGet('SELECT * FROM alerts WHERE id = ? AND user_id = ?', [alertId, userId]);
        if (!alert) {
            return res.status(404).json({ error: 'Alerta não encontrado.' });
        }
        await dbRun('DELETE FROM alerts WHERE id = ?', [alertId]);
        res.json({ message: 'Alerta removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover alerta:', error);
        res.status(500).json({ error: 'Erro ao remover alerta.' });
    }
});

const checkAlerts = async () => {
    try {
        const alerts = await new Promise((resolve, reject) => {
            db.all('SELECT a.id, a.user_id, a.simbolo, a.target_price FROM alerts a WHERE a.triggered = 0', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        if (alerts.length === 0) {
            console.log('Nenhum alerta para verificar.');
            return;
        }
        const symbols = [...new Set(alerts.map(alert => alert.simbolo))].join(',');
        const response = await fetch(`https://seu-endereco2.ngrok.io/stock-prices?symbols=${symbols}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar preços das ações para verificação de alertas.');
        }
        const pricesData = await response.json();
        const pricesMap = {};
        pricesData.forEach(item => {
            pricesMap[item.symbol] = item.c;
        });
        for (const alert of alerts) {
            const currentPrice = pricesMap[alert.simbolo];
            if (currentPrice && currentPrice > alert.target_price) {
                console.log(`Alerta disparado para userId ${alert.user_id}: ${alert.simbolo} atingiu R$ ${currentPrice}`);
                await dbRun('UPDATE alerts SET triggered = 1 WHERE id = ?', [alert.id]);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar alertas:', error);
    }
};
setInterval(checkAlerts, 60000);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});