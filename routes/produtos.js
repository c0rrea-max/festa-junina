// =============================================================
// routes/pescaria.js — API Barraca da Pescaria
// =============================================================

const express = require('express');

const router = express.Router();

const supabase = require('../data/supabase');

/* ============================================================
   [GET] RANKING GLOBAL
============================================================ */
// GET /api/pescaria/ranking

router.get('/ranking', async (req, res, next) => {

    try {

        const { data, error } = await supabase

            .from('ranking')

            .select(`
                id,
                melhor_pontuacao,
                jogadores (
                    nome
                )
            `)

            .order('melhor_pontuacao', {

                ascending:false

            })

            .limit(20);

        if(error){

            throw error;

        }

        res.json({

            sucesso:true,

            total:data.length,

            ranking:data

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [GET] JOGADOR POR CPF
============================================================ */
// GET /api/pescaria/jogador/:cpf

router.get('/jogador/:cpf', async (req, res, next) => {

    try {

        const { data, error } = await supabase

            .from('jogadores')

            .select('*')

            .eq('cpf', req.params.cpf)

            .single();

        if(error && error.code !== 'PGRST116'){

            throw error;

        }

        if(!data){

            return res.status(404).json({

                sucesso:false,

                mensagem:'❌ Jogador não encontrado.'

            });

        }

        res.json({

            sucesso:true,

            jogador:data

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [POST] CADASTRAR JOGADOR
============================================================ */
// POST /api/pescaria/jogador

router.post('/jogador', async (req, res, next) => {

    try {

        const {

            nome,
            cpf,
            email

        } = req.body;

        if(!nome || !cpf || !email){

            return res.status(400).json({

                sucesso:false,

                mensagem:'⚠ Nome, CPF e e-mail são obrigatórios.'

            });

        }

        // VERIFICA SE JÁ EXISTE
        const { data: existente } = await supabase

            .from('jogadores')

            .select('*')

            .eq('cpf', cpf)

            .maybeSingle();

        if(existente){

            return res.json({

                sucesso:true,

                mensagem:'✅ Jogador já cadastrado.',

                jogador:existente

            });

        }

        const { data, error } = await supabase

            .from('jogadores')

            .insert([{

                nome,
                cpf,
                email,
                saldo:0

            }])

            .select()

            .single();

        if(error){

            throw error;

        }

        res.status(201).json({

            sucesso:true,

            mensagem:'🎣 Jogador cadastrado com sucesso!',

            jogador:data

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [POST] SALVAR PARTIDA
============================================================ */
// POST /api/pescaria/partida

router.post('/partida', async (req, res, next) => {

    try {

        const {

            jogador_id,
            pontuacao,
            tempo_segundos

        } = req.body;

        if(!jogador_id || pontuacao === undefined){

            return res.status(400).json({

                sucesso:false,

                mensagem:'⚠ Dados da partida inválidos.'

            });

        }

        /* ====================================================
           SALVA PARTIDA
        ==================================================== */

        const { data, error } = await supabase

            .from('partidas')

            .insert([{

                jogador_id,
                pontuacao,
                tempo_segundos: tempo_segundos || 15

            }])

            .select()

            .single();

        if(error){

            throw error;

        }

        /* ====================================================
           ATUALIZA SALDO
        ==================================================== */

        const { data:jogador } = await supabase

            .from('jogadores')

            .select('saldo')

            .eq('id', jogador_id)

            .single();

        const novoSaldo = (jogador?.saldo || 0) + pontuacao;

        await supabase

            .from('jogadores')

            .update({

                saldo:novoSaldo

            })

            .eq('id', jogador_id);

        /* ====================================================
           ATUALIZA RANKING
        ==================================================== */

        const { data:ranking } = await supabase

            .from('ranking')

            .select('*')

            .eq('jogador_id', jogador_id)

            .maybeSingle();

        if(!ranking){

            await supabase

                .from('ranking')

                .insert([{

                    jogador_id,
                    melhor_pontuacao:pontuacao

                }]);

        }

        else if(pontuacao > ranking.melhor_pontuacao){

            await supabase

                .from('ranking')

                .update({

                    melhor_pontuacao:pontuacao

                })

                .eq('id', ranking.id);

        }

        res.status(201).json({

            sucesso:true,

            mensagem:'🏆 Partida salva com sucesso!',

            partida:data,

            saldo:novoSaldo

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [GET] INVENTÁRIO
============================================================ */
// GET /api/pescaria/inventario/:jogador_id

router.get('/inventario/:jogador_id', async (req, res, next) => {

    try {

        const { data, error } = await supabase

            .from('inventario')

            .select('*')

            .eq('jogador_id', req.params.jogador_id);

        if(error){

            throw error;

        }

        res.json({

            sucesso:true,

            total:data.length,

            itens:data

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [POST] RESGATAR ITEM
============================================================ */
// POST /api/pescaria/resgatar

router.post('/resgatar', async (req, res, next) => {

    try {

        const {

            jogador_id,
            item_id,
            item_nome,
            item_emoji,
            preco

        } = req.body;

        if(

            !jogador_id ||
            !item_id ||
            !item_nome ||
            !preco

        ){

            return res.status(400).json({

                sucesso:false,

                mensagem:'⚠ Dados inválidos.'

            });

        }

        /* ====================================================
           BUSCA JOGADOR
        ==================================================== */

        const { data:jogador } = await supabase

            .from('jogadores')

            .select('*')

            .eq('id', jogador_id)

            .single();

        if(!jogador){

            return res.status(404).json({

                sucesso:false,

                mensagem:'❌ Jogador não encontrado.'

            });

        }

        if(jogador.saldo < preco){

            return res.status(400).json({

                sucesso:false,

                mensagem:'💸 Saldo insuficiente.'

            });

        }

        /* ====================================================
           VERIFICA ITEM DUPLICADO
        ==================================================== */

        const { data:existente } = await supabase

            .from('inventario')

            .select('*')

            .eq('jogador_id', jogador_id)

            .eq('item_id', item_id)

            .maybeSingle();

        if(existente){

            return res.status(400).json({

                sucesso:false,

                mensagem:'🎁 Item já resgatado.'

            });

        }

        /* ====================================================
           SALVA ITEM
        ==================================================== */

        const { data, error } = await supabase

            .from('inventario')

            .insert([{

                jogador_id,
                item_id,
                item_nome,
                item_emoji,
                preco

            }])

            .select()

            .single();

        if(error){

            throw error;

        }

        /* ====================================================
           DESCONTA SALDO
        ==================================================== */

        const novoSaldo = jogador.saldo - preco;

        await supabase

            .from('jogadores')

            .update({

                saldo:novoSaldo

            })

            .eq('id', jogador_id);

        res.status(201).json({

            sucesso:true,

            mensagem:'🎉 Item resgatado com sucesso!',

            item:data,

            saldo:novoSaldo

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;