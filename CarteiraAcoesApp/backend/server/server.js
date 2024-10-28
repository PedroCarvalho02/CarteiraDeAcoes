

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/register', async (req, res) => {
    const { email, senha } = req.body;
  
    try {
      // Criptografar senha
      const hashedSenha = await bcrypt.hash(senha, 10);
      const novoUsuario = new User({ email, senha: hashedSenha });
      await novoUsuario.save();
  
      res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao registrar usuário.' });
    }
  });


  app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
  
    try {
      const usuario = await usuario.findOne({ email });
      if (!usuario) {
        return res.status(400).json({ error: 'Usuário não encontrado.' });
      }
  
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(400).json({ error: 'Senha incorreta.' });
      }
  
      const token = jwt.sign({ id: usuario._id, email: usuario.email }, 'secreta', { expiresIn: '1h' });
  
      res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor.' });
    }
  });
  
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });