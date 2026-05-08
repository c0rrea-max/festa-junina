// =============================================================
// routes/cadastros.js — Rotas de Cadastros Barraca da Pescaria
// =============================================================

const express = require('express');

const router = express.Router();

const supabase = require('../data/supabase');

/* ============================================================
   [GET] LISTAR CADASTROS
============================================================ */
// GET /api/cadastros

router.get('/', async (req, res, next) => {

    try {

        const { data, error } = await supabase

            .from('cadastros')

            .select('*')

            .order('id', { ascending:false });

        if(error){

            throw error;

        }

        res.json({

            sucesso:true,

            total:data.length,

            cadastros:data

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [GET] CADASTRO POR ID
============================================================ */
// GET /api/cadastros/:id

router.get('/:id', async (req, res, next) => {

    try {

        const { data, error } = await supabase

            .from('cadastros')

            .select('*')

            .eq('id', req.params.id)

            .single();

        if(error){

            throw error;

        }

        if(!data){

            return res.status(404).json({

                sucesso:false,

                mensagem:'❌ Cadastro não encontrado.'

            });

        }

        res.json({

            sucesso:true,

            cadastro:data

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [POST] CRIAR CADASTRO
============================================================ */
// POST /api/cadastros

router.post('/', async (req, res, next) => {

    try {

        const {

            nome,
            cpf,
            email,
            saldo,
            status

        } = req.body;

        if(!nome || !cpf || !email){

            return res.status(400).json({

                sucesso:false,

                mensagem:'⚠ Dados obrigatórios não enviados.'

            });

        }

        // VERIFICA CPF DUPLICADO
        const { data:existente } = await supabase

            .from('cadastros')

            .select('*')

            .eq('cpf', cpf)

            .maybeSingle();

        if(existente){

            return res.status(400).json({

                sucesso:false,

                mensagem:'⚠ CPF já cadastrado.'

            });

        }

        const { data, error } = await supabase

            .from('cadastros')

            .insert([{

                nome,
                cpf,
                email,
                saldo: saldo || 0,
                status: status || 'Ativo'

            }])

            .select();

        if(error){

            throw error;

        }

        res.status(201).json({

            sucesso:true,

            mensagem:'🎉 Cadastro realizado com sucesso!',

            cadastro:data[0]

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [PUT] ATUALIZAR CADASTRO
============================================================ */
// PUT /api/cadastros/:id

router.put('/:id', async (req, res, next) => {

    try {

        const {

            nome,
            cpf,
            email,
            saldo,
            status

        } = req.body;

        const { data, error } = await supabase

            .from('cadastros')

            .update({

                nome,
                cpf,
                email,
                saldo,
                status

            })

            .eq('id', req.params.id)

            .select();

        if(error){

            throw error;

        }

        res.json({

            sucesso:true,

            mensagem:'✏️ Cadastro atualizado.',

            cadastro:data[0]

        });

    }

    catch(err){

        next(err);

    }

});

/* ============================================================
   [DELETE] DELETAR CADASTRO
============================================================ */
// DELETE /api/cadastros/:id

router.delete('/:id', async (req, res, next) => {

    try {

        const { error } = await supabase

            .from('cadastros')

            .delete()

            .eq('id', req.params.id);

        if(error){

            throw error;

        }

        res.json({

            sucesso:true,

            mensagem:'🗑 Cadastro removido com sucesso.'

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