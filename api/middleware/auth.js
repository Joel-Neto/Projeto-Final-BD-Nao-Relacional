import jwt from "jsonwebtoken";

export default async function auth(req, res, next) {
    const token = req.header("access-token");
    if (!token) return res.status(401).json({
        msg: "Acesso negado. É obrigatório o envio do token JWT"
    });

    try {
        const deocded = jwt.verify(token, process.env.SECRETE_KEY);
        /*
        O decoded irá conter:
        payload - ID do usuário
        exp (expiration) - Data de expiração
        iat (issued at) - Data de criação
        */
       req.usuario = await deocded.usuario;
       next(); //direcionamos para ao próximo endpoint
    } catch (error) {
        res.status(403).send({error: `Token Inválido: ${error.message}`})
    }
}