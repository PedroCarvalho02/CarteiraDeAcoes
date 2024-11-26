const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const { OAuth2Client } = require('google-auth-library');
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

// Verifica e adiciona a coluna googleId se necessário
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

app.get('/auth', (req, res) => {
    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URIS
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent',
    });

    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    console.log('Callback Google recebido');
    const { code } = req.query;

    if (!code) {
        console.error('❌ Código não encontrado');
        return res.status(400).send('Código ausente');
    }

    try {
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URIS
        );

        console.log(' Obtendo tokens...');
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log('🔄 Obtendo dados do usuário...');
        const userInfoResponse = await oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });

        const userInfo = userInfoResponse.data;

        let user = await findUserByGoogleId(userInfo.sub);

        if (!user) {
            console.log('Criando novo usuário');
            await createUser({
                googleId: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                profilePicture: userInfo.picture,
            });
            user = await findUserByGoogleId(userInfo.sub);
        }

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            'secret_key',
            { expiresIn: '1h' }
        );
        console.log('JWT gerado');

        const redirectUrl = `${process.env.IP_FRONT}?token=${jwtToken}`;
        console.log(' Redirecionando para:', redirectUrl);
        res.redirect(redirectUrl);

    } catch (error) {
        console.error(' Erro:', error);
        res.status(500).send('Erro na autenticação');
    }
});

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
        // Obter o preço atual da ação
        const response = await fetch(`https://hog-chief-visually.ngrok-free.app/stock-prices?symbols=${simbolo}`);
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

        // Verificar saldo do usuário
        const usuario = await dbGet('SELECT saldo FROM users WHERE id = ?', [userId]);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (usuario.saldo < totalCompra) {
            return res.status(400).json({ error: 'Saldo insuficiente para realizar a compra.' });
        }

        // Verificar se o usuário já possui a ação
        const acaoExistente = await dbGet('SELECT * FROM user_acoes WHERE user_id = ? AND simbolo = ?', [userId, simbolo]);

        if (acaoExistente) {
            // Calcular novo preço médio
            const novaQuantidade = acaoExistente.quantidade + quantidade;
            const novoPrecoCompra = ((acaoExistente.quantidade * acaoExistente.preco_compra) + (quantidade * precoAtual)) / novaQuantidade;

            // Atualizar a ação existente
            await dbRun(
                'UPDATE user_acoes SET quantidade = ?, preco_compra = ? WHERE id = ?',
                [novaQuantidade, novoPrecoCompra, acaoExistente.id]
            );
        } else {
            // Inserir nova ação
            await dbRun(
                'INSERT INTO user_acoes (user_id, simbolo, quantidade, preco_compra) VALUES (?, ?, ?, ?)',
                [userId, simbolo, quantidade, precoAtual]
            );
        }

        // Deduzir o saldo do usuário
        await dbRun('UPDATE users SET saldo = saldo - ? WHERE id = ?', [totalCompra, userId]);

        // Obter o novo saldo
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
        // Verificar se o usuário possui a ação e a quantidade suficiente
        const acaoExistente = await dbGet(
            'SELECT * FROM user_acoes WHERE user_id = ? AND simbolo = ?',
            [userId, simbolo]
        );

        if (!acaoExistente || acaoExistente.quantidade < quantidade) {
            return res.status(400).json({ error: 'Quantidade insuficiente de ações para venda.' });
        }

        // Obter o preço atual da ação
        const response = await fetch(
            `https://hog-chief-visually.ngrok-free.app/stock-prices?symbols=${simbolo}`
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

        // Atualizar a quantidade de ações do usuário
        const novaQuantidade = acaoExistente.quantidade - quantidade;
        if (novaQuantidade > 0) {
            await dbRun(
                'UPDATE user_acoes SET quantidade = ? WHERE id = ?',
                [novaQuantidade, acaoExistente.id]
            );
        } else {
            await dbRun('DELETE FROM user_acoes WHERE id = ?', [acaoExistente.id]);
        }

        // Atualizar o saldo do usuário
        await dbRun('UPDATE users SET saldo = saldo + ? WHERE id = ?', [totalVenda, userId]);

        // Obter o novo saldo
        const novoSaldo = await dbGet('SELECT saldo FROM users WHERE id = ?', [userId]);

        res.json({
            message: `Vendidas ${quantidade} ações de ${simbolo} por R$ ${precoAtual.toFixed(
                2
            )} cada.`,
            saldo: novoSaldo.saldo,
        });
    } catch (error) {
        console.error('Erro ao vender ação:', error);
        res.status(500).json({ error: error.message || 'Erro ao realizar a venda.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});