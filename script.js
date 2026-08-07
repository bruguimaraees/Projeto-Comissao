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

// ==========================================
// LÓGICA DA TELA DE CÁLCULO DE COMISSÃO
// ==========================================

// Pega o botão da tela de comissão
let btnCalcularComissao = document.getElementById("btn-calcular-comissao");

// Só executa se o botão existir (ou seja, só se estivermos na tela certa)
if (btnCalcularComissao) {
    btnCalcularComissao.addEventListener("click", function() {
        
        // 1. Pega os valores das datas digitadas
        let dataInicio = document.getElementById("comissao-data-inicio").value;
        let dataFim = document.getElementById("comissao-data-fim").value;
        
        // Trava de segurança se o usuário esquecer a data
        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione a Data Inicial e a Data Final para calcular.");
            return;
        }

        // 2. Busca todas as vendas e filtra pelo período exato (igual fizemos na outra tela)
        let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
        
        let vendasFiltradas = vendasSalvas.filter(function(venda) {
            return venda.data >= dataInicio && venda.data <= dataFim;
        });

        // 3. Soma o valor de todas as vendas desse período
        let totalVendidoPeriodo = 0;
        vendasFiltradas.forEach(function(venda) {
            totalVendidoPeriodo += venda.valor;
        });

        // =========================================================
        // 4. A HORA DA MÁGICA: Chamamos a SUA função passando o total!
        // =========================================================
        let valorComissao = registroVendas(totalVendidoPeriodo);

        // 5. Injeta os resultados nos Cards da tela
        
        // Card 1: Total Vendido
        document.getElementById("res-total-vendido").innerText = `R$ ${totalVendidoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
        // Card 2: Meta Atingida (Muda o texto e a cor dependendo do resultado!)
        let cardMeta = document.getElementById("res-meta-atingida");
        if (totalVendidoPeriodo >= 7500) {
            cardMeta.innerText = "Sim! 🚀";
            cardMeta.style.color = "#28a745"; // Verde
        } else {
            cardMeta.innerText = "Não 😢";
            cardMeta.style.color = "#dc3545"; // Vermelho
        }

        // Card 3: O valor final da Comissão (o resultado da sua função)
        document.getElementById("res-valor-comissao").innerText = `R$ ${valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    });
}

// ==========================================
// LÓGICA DA TELA DE ONBOARDING
// ==========================================

let btnSalvarOnb = document.getElementById("btn-salvar-onb");

if (btnSalvarOnb) {
    btnSalvarOnb.addEventListener("click", function(e) {
        e.preventDefault();
        
        let cliente = document.getElementById("onb-cliente").value;
        let dataAgendamento = document.getElementById("onb-data").value;
        let planilhaOk = document.getElementById("onb-planilha").checked;
        let manualOk = document.getElementById("onb-manual").checked;
        let obs = document.getElementById("onb-obs").value;

        if (!cliente) {
            alert("Por favor, preencha o nome do cliente.");
            return;
        }

        // Criamos a ficha do onboarding, anotando o mês e ano em que ele foi criado!
        let dataAtual = new Date();
        let novoOnboarding = {
            id: Date.now(), // Cria um identificador único baseado no milissegundo atual
            cliente: cliente,
            dataAgendamento: dataAgendamento,
            planilhaOk: planilhaOk,
            manualOk: manualOk,
            obs: obs,
            mesCriacao: dataAtual.getMonth(),
            anoCriacao: dataAtual.getFullYear()
        };

        let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
        listaOnboarding.push(novoOnboarding);
        localStorage.setItem("listaOnboarding", JSON.stringify(listaOnboarding));

        // Limpa os campos após salvar
        document.getElementById("onb-cliente").value = "";
        document.getElementById("onb-data").value = "";
        document.getElementById("onb-planilha").checked = false;
        document.getElementById("onb-manual").checked = false;
        document.getElementById("onb-obs").value = "";

        carregarTabelaOnboarding();
    });
}

// Função para desenhar a tabela com a regra da virada de mês
function carregarTabelaOnboarding() {
    let corpoTabela = document.getElementById("tabela-onboarding");
    if (!corpoTabela) return;

    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
    let mesAtual = new Date().getMonth();
    let anoAtual = new Date().getFullYear();

    corpoTabela.innerHTML = "";

    // A MÁGICA DA VIRADA DE MÊS ACONTECE AQUI NO FILTER
    let listaFiltrada = listaOnboarding.filter(function(item) {
        let ehDoMesAtual = (item.mesCriacao === mesAtual && item.anoCriacao === anoAtual);
        let estaTudoConcluido = (item.planilhaOk === true && item.manualOk === true);

        if (ehDoMesAtual) {
            return true; // É desse mês? Mostra na tela!
        } else {
            // É de meses passados? Só mostra se tiver pendência.
            if (estaTudoConcluido) {
                return false; // Se tá tudo OK, some da tela.
            } else {
                return true; // Se falta check, continua cobrando!
            }
        }
    });

    if (listaFiltrada.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="5" style="padding: 20px;">Nenhuma implantação pendente no momento.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(function(item) {
        let dataFormatada = item.dataAgendamento ? item.dataAgendamento.split('-').reverse().join('/') : '-';
        
        let linha = document.createElement("tr");
        linha.innerHTML = `
            <td><strong>${item.cliente}</strong></td>
            <td>${dataFormatada}</td>
            
            <!-- Injetamos uma função no clique do checkbox para atualizar o sistema -->
            <td>
                <input type="checkbox" class="check-tabela" 
                onchange="atualizarCheckOnboarding(${item.id}, 'planilhaOk')" 
                ${item.planilhaOk ? "checked" : ""}>
            </td>
            
            <td>
                <input type="checkbox" class="check-tabela" 
                onchange="atualizarCheckOnboarding(${item.id}, 'manualOk')" 
                ${item.manualOk ? "checked" : ""}>
            </td>
            
            <td style="font-size: 12px; color: #555; max-width: 200px;">${item.obs}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Função invocada quando você clica em um checkbox direto na tabela
function atualizarCheckOnboarding(id, qualCheckbox) {
    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
    
    // Procura na lista qual é o cliente que tem esse ID
    let index = listaOnboarding.findIndex(item => item.id === id);
    
    if (index !== -1) {
        // Inverte o valor (se era true vira false, se era false vira true)
        listaOnboarding[index][qualCheckbox] = !listaOnboarding[index][qualCheckbox];
        
        // Salva de volta no sistema
        localStorage.setItem("listaOnboarding", JSON.stringify(listaOnboarding));
        
        // Recarrega a tabela (se o mês já virou e você marcou o último check, ele vai sumir da tela instantaneamente!)
        carregarTabelaOnboarding(); 
    }
}

carregarTabelaOnboarding();

// ==========================================
// PREENCHER DROPDOWN DE CLIENTES NO ONBOARDING
// ==========================================

function preencherDropdownClientes() {
    let selectCliente = document.getElementById("onb-cliente");
    
    // Se não estivermos na tela de onboarding, a função para por aqui
    if (!selectCliente) return; 

    // 1. Busca as vendas salvas
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    
    // Dica Nerd de Front-end: Como um mesmo cliente pode ter feito 2 compras separadas,
    // nós usamos um comando chamado 'Set' para arrancar fora os nomes repetidos. 
    // Assim, o nome do cliente só aparece uma vez na sua lista!
    let nomesUnicos = [...new Set(vendasSalvas.map(venda => venda.cliente))];

    // 2. Limpa o select (mantendo só a opção padrão)
    selectCliente.innerHTML = '<option value="">Selecione um cliente das vendas...</option>';

    // 3. Cria uma <option> nova para cada cliente encontrado
    nomesUnicos.forEach(function(nome) {
        let opcao = document.createElement("option");
        opcao.value = nome;
        opcao.textContent = nome;
        selectCliente.appendChild(opcao);
    });
}

// Executa a função assim que a página abrir
preencherDropdownClientes();