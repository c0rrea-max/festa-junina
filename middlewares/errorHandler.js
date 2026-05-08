// =============================================================
// middlewares/errorHandlerMiddleware.js
// Middleware Global de Erros — Barraca da Pescaria
// =============================================================

const errorHandlerMiddleware = (err, req, res, next) => {

    /* ========================================================
       LOG DO ERRO NO TERMINAL
    ======================================================== */

    console.error('\n========================================');
    console.error('❌ ERRO INTERNO NA API');
    console.error('📍 Rota:', req.originalUrl);
    console.error('📌 Método:', req.method);
    console.error('🕒 Data:', new Date().toLocaleString('pt-BR'));
    console.error('💥 Mensagem:', err.message);

    if(err.stack){

        console.error('\n📚 Stack Trace:\n');
        console.error(err.stack);

    }

    console.error('========================================\n');

    /* ========================================================
       STATUS HTTP
    ======================================================== */

    const statusCode = err.statusCode || 500;

    /* ========================================================
       RESPOSTA JSON
    ======================================================== */

    res.status(statusCode).json({

        sucesso:false,

        mensagem:

            statusCode === 404

                ? '❌ Recurso não encontrado.'

                : statusCode === 400

                    ? '⚠️ Dados inválidos enviados.'

                    : '🎣 Ops! Ocorreu um erro interno no servidor.',

        erro:err.message,

        rota:req.originalUrl,

        metodo:req.method,

        timestamp:new Date().toISOString()

    });

};

/* ============================================================
   EXPORT
============================================================ */

module.exports = errorHandlerMiddleware;