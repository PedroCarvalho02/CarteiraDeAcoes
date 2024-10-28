const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const PORT = 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./banco.db", (err) => {
    if (err) {
        console.error("Erro ao conectar banco de dados", err.message);
    }
    console.log("conectado");
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT,
    cep TEXT
)`);

const dbGet = promisify(db.get).bind(db);
const dbRun = promisify(db.run).bind(db);


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
        await dbRun('INSERT INTO users (email, senha, nome, cpf, telefone, cep) VALUES (?, ?, ?, ?, ?, ?)', 
                    [email, hashedSenha, nome, cpf, telefone, cep]);
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error("Erro no servidor:", error);
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

        const token = jwt.sign({ id: usuario.id, email: usuario.email }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});