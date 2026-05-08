// =============================================================
// middlewares/loggerMiddleware.js
// Logger de Requisições — Barraca da Pescaria
// =============================================================

const loggerMiddleware = (req, res, next) => {

    /* ========================================================
       DATA E HORA FORMATADA
    ======================================================== */

    const agora = new Date();

    const hora = agora.toLocaleTimeString('pt-BR');
    const data = agora.toLocaleDateString('pt-BR');

    /* ========================================================
       LOG PRINCIPAL
    ======================================================== */

    console.log('\n----------------------------------------');
    console.log(`📅 ${data} ⏰ ${hora}`);
    console.log(`📡 ${req.method} ${req.originalUrl}`);
    console.log(`🌐 IP: ${req.ip}`);
    console.log(`🧭 User-Agent: ${req.headers['user-agent']}`);
    console.log('----------------------------------------\n');

    /* ========================================================
       CONTINUA FLUXO DA REQUISIÇÃO
    ======================================================== */

    next();
};

/* ============================================================
   EXPORT
============================================================ */

module.exports = loggerMiddleware;