// 1. O MOTOR MATEMÁTICO (Sua obra-prima)

function registroVendas(totalVendas) {
    const meta = 7500;

    if (totalVendas <= 7500) {
        let comissaoEsperadaMeta = (totalVendas * 40) / 100;
        return comissaoEsperadaMeta;
    } else {
        let comissaoEsperadaMeta = (meta * 40) / 100;
        let superMeta = totalVendas - meta;
        let comissaoEsperadaSuper = (superMeta * 80) / 100;

        let comissaoTotal = comissaoEsperadaMeta + comissaoEsperadaSuper;
        return comissaoTotal;
    }
}

let campoCliente = document.getElementById("nome-cliente")
let campoData = document.getElementById("data-venda")
let campoVenda = document.getElementById("valor-da-venda")
let campoDesconto = document.getElementById("meses-desconto")

let btnSalvar = document.getElementById("botao-salvar")
let campoResult = document.getElementById("texto-resultado")

if (btnSalvar){

    btnSalvar.addEventListener("click", function() {
        event.preventDefault();

        // 1. Cria a fichinha com os dados da tela
        let dadosDaVenda = {
            cliente: campoCliente.value,
            data: campoData.value,
            valor: Number(campoVenda.value),
            mesesDesconto: Number(campoDesconto.value)
        };

        // 2. Busca o que já estava salvo ou cria uma lista vazia
        let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
        
        // 3. Adiciona a venda nova na lista
        vendasSalvas.push(dadosDaVenda);

        // 4. Salva tudo de volta no navegador
        localStorage.setItem("listaVendas", JSON.stringify(vendasSalvas));

        console.log(dadosDaVenda);

        alert("Venda registrada com sucesso!");

        atualizarTabela();
        atualizarGrafico();
    });

}
    

function atualizarTabela(){
    // 1. Busca os dados salvos no navegador ou cria uma lista vazia
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    
    // 2. Inverte a ordem para a venda mais recente aparecer no topo
    vendasSalvas.reverse(); 

    // 3. Pega os elementos da tabela e dos cards pelo ID
    let corpoTabela = document.getElementById("tabela-ultimas-vendas");
    let cardAcumulado = document.getElementById("card-acumulado");
    let cardMedia = document.getElementById("card-media");
    let cardTotal = document.getElementById("card-total");

    let valorAcumulado = 0;
    let totalRegistros = vendasSalvas.length;

    // 4. Se a tabela existir na página, limpa e desenha as linhas
    if (corpoTabela) {
        corpoTabela.innerHTML =""; 

        vendasSalvas.forEach(function(venda) {
            valorAcumulado += venda.valor; // Soma o valor para o total acumulado

            let linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${venda.cliente}</td>
                <td>R$ ${venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            `;
            corpoTabela.appendChild(linha);
        });
    } else {
        // Se estiver na página de cadastro (sem tabela), apenas soma os valores
        vendasSalvas.forEach(function(venda) {
            valorAcumulado += venda.valor;
        });
    }

    // 5. Calcula a média matemática das vendas
    let mediaVendas = totalRegistros > 0 ? valorAcumulado / totalRegistros : 0;

    // 6. Joga os valores calculados para dentro dos cards na tela
    if (cardAcumulado) {
        cardAcumulado.innerText = `R$ ${valorAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (cardMedia) {
        cardMedia.innerText = `R$ ${mediaVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (cardTotal) {
        cardTotal.innerText = `${totalRegistros} Registro${totalRegistros === 1 ? '' : 's'}`;
    }
}

// Executa assim que a página abre
atualizarTabela();

let meuGrafico = null; // Variável global para controlar o gráfico

function atualizarGrafico() {
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    let ctx = document.getElementById('graficoVendas');

    if (!ctx) return;

    // Pega os dados das vendas (limitando para mostrar os últimos se quiser, ou todos)
    let labels = vendasSalvas.map(v => v.cliente);
    let dadosValores = vendasSalvas.map(v => v.valor);

    // Se já existir um gráfico criado antes, destruímos ele para atualizar sem bugar
    if (meuGrafico) {
        meuGrafico.destroy();
    }

    // Cria o novo gráfico usando Chart.js
    meuGrafico = new Chart(ctx, {
        type: 'bar', // Pode trocar por 'line' se preferir gráfico de linha
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor da Venda (R$)',
                data: dadosValores,
                backgroundColor: '#3d22d4',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

atualizarGrafico();

// ==========================================
// LÓGICA DA TELA DE CONSULTA DE VENDAS
// ==========================================

function carregarConsultaVendas(vendasParaMostrar = null) {
    let corpoTabela = document.getElementById("tabela-consulta");
    
    // Se não estivermos na tela de consulta, a função para por aqui para não dar erro
    if (!corpoTabela) return; 

    // Se não passarmos vendas filtradas, ele pega a lista inteira
    let vendas = vendasParaMostrar || JSON.parse(localStorage.getItem("listaVendas")) || [];
    
    // Limpa a tabela antes de preencher
    corpoTabela.innerHTML = "";

    // Mensagem amigável caso não ache nada
    if (vendas.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhuma venda encontrada para este período.</td></tr>`;
        return;
    }

    // Preenche a tabela linha por linha
    vendas.forEach(function(venda) {
        // Formata a data (de AAAA-MM-DD para DD/MM/AAAA)
        let dataFormatada = venda.data.split('-').reverse().join('/');
        
        let linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${venda.cliente}</td>
            <td>${dataFormatada}</td>
            <td>R$ ${venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${venda.mesesDesconto}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Botão Filtrar
let btnFiltrar = document.getElementById("btn-filtrar");
if (btnFiltrar) {
    btnFiltrar.addEventListener("click", function() {
        let dataInicio = document.getElementById("data-inicio").value;
        let dataFim = document.getElementById("data-fim").value;
        let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];

        // Verifica se o usuário preencheu os dois campos
        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione a Data Inicial e a Data Final.");
            return;
        }

        // A mágica do JavaScript: O método .filter() separa só o que queremos
        let vendasFiltradas = vendasSalvas.filter(function(venda) {
            // No HTML, datas vêm no formato AAAA-MM-DD. O JS consegue comparar isso diretamente!
            return venda.data >= dataInicio && venda.data <= dataFim;
        });

        carregarConsultaVendas(vendasFiltradas);
    });
}

// Botão Limpar Filtro
let btnLimpar = document.getElementById("btn-limpar");
if (btnLimpar) {
    btnLimpar.addEventListener("click", function() {
        document.getElementById("data-inicio").value = "";
        document.getElementById("data-fim").value = "";
        
        // Chama a função vazia para carregar todas as vendas de novo
        carregarConsultaVendas(); 
    });
}

// Carrega todas as vendas assim que a página de consulta for aberta
carregarConsultaVendas();