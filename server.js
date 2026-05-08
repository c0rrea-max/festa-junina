const supabase = supabase.createClient(
  "https://SEU-PROJETO.supabase.co",
  "SUA-ANON-KEY"
);
async function validarCadastro(){
  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const email = document.getElementById('email').value.trim();

  if(!nome || !cpf || !email){
    shake(document.querySelector('#cadastro .btn-primary'));
    return;
  }

  const { data, error } = await supabase
    .from('cadastros')
    .insert([{ nome, cpf, email }])
    .select();

  if(error){
    alert("Erro ao cadastrar");
    return;
  }

  localStorage.setItem("user_id", data[0].id);

  showScreen('pontuacao');
}
async function salvarPartida(){
  const userId = localStorage.getItem("user_id");

  await supabase
    .from('partidas')
    .insert([{
      cadastro_id: userId,
      pontos: ptsPartida,
      tempo: 15
    }]);

  // atualiza pontos globais
  await supabase
    .from('cadastros')
    .update({ pontos: pontosAcumulados })
    .eq('id', userId);
}
await salvarPartida();
async function comprar(id){
  const item = catalogo.find(c => c.id === id);
  if(!item || compras[id] || pontosAcumulados < item.preco) return;

  const userId = localStorage.getItem("user_id");

  pontosAcumulados -= item.preco;
  compras[id] = true;

  await supabase.from('inventario').insert([{
    cadastro_id: userId,
    item_id: item.id,
    nome: item.nome,
    emoji: item.emoji,
    preco: item.preco
  }]);

  await supabase
    .from('cadastros')
    .update({ pontos: pontosAcumulados })
    .eq('id', userId);

  renderLoja();
  atualizarWallets();
}
async function carregarUsuario(){
  const userId = localStorage.getItem("user_id");

  const { data } = await supabase
    .from('cadastros')
    .select('*')
    .eq('id', userId)
    .single();

  if(data){
    pontosAcumulados = data.pontos;
    atualizarWallets();
  }
}