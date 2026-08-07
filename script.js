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
    btnSalvar.addEventListener("click", function(event) {
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

        // Busca a caixinha lá no HTML
        let toast = document.getElementById("toast-sucesso");
        
        if (toast) {
            // Adiciona a classe que faz a caixinha aparecer na tela
            toast.classList.add("mostrar");
            
            // O setTimeout é um relógio. Aqui mandamos ele esperar 3 segundos (3000ms) e remover a classe
            setTimeout(function() {
                toast.classList.remove("mostrar");
            }, 3000);
        } else {
            // Se der algum erro e ele não achar a caixa nova, mostra o alert velho por segurança
            alert("Venda registrada com sucesso!");
        }

        atualizarTabela();
        atualizarGrafico();
    });
}
    

function atualizarTabela(){
    // 1. Busca os dados salvos no navegador ou cria uma lista vazia
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    
    // 2. Inverte a ordem para a venda mais recente aparecer no topo
    let vendasCopia = [...vendasSalvas].reverse(); 

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

        vendasCopia.forEach(function(venda) {
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
        corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhuma venda encontrada para este período.</td></tr>`;
        return;
    }

    // Preenche a tabela linha por linha
    vendas.forEach(function(venda, index) { // <--- PEGAMOS O 'index' AQUI
        let dataFormatada = venda.data.split('-').reverse().join('/');
        
        let linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${venda.cliente}</td>
            <td>${dataFormatada}</td>
            <td>R$ ${venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${venda.mesesDesconto}</td>
            <td><button class="btn-excluir" onclick="deletarVenda(${index})">Excluir</button></td> <!-- BOTÃO DELETAR -->
        `;
        corpoTabela.appendChild(linha);
    });
}

// ==========================================
// FUNÇÃO DE DELETAR VENDA (COM MODAL CUSTOMIZADO)
// ==========================================

// Variável para guardar o número da venda que o usuário quer apagar
let indexParaDeletar = null; 

function deletarVenda(index) {
    indexParaDeletar = index; // Salva a posição da venda
    
    // Faz a caixinha bonitinha aparecer na tela
    let modal = document.getElementById("modal-confirmacao");
    if(modal) modal.classList.add("mostrar");
}

// Lógica dos botões de dentro da caixinha nova
let btnCancelarExclusao = document.getElementById("btn-cancelar-exclusao");
let btnConfirmarExclusao = document.getElementById("btn-confirmar-exclusao");

// Se ele clicar em "Cancelar"
if (btnCancelarExclusao) {
    btnCancelarExclusao.addEventListener("click", function() {
        let modal = document.getElementById("modal-confirmacao");
        if(modal) modal.classList.remove("mostrar");
        indexParaDeletar = null; // Limpa a memória
    });
}

// Se ele clicar em "Sim, excluir"
if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener("click", function() {
        if (indexParaDeletar !== null) {
            // 1. Pega os dados e remove a venda
            let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
            vendasSalvas.splice(indexParaDeletar, 1);
            localStorage.setItem("listaVendas", JSON.stringify(vendasSalvas));

            // 2. Atualiza a tela
            if (typeof carregarConsultaVendas === "function") carregarConsultaVendas();
            if (typeof atualizarTabela === "function") atualizarTabela();
            if (typeof atualizarGrafico === "function") atualizarGrafico();

            // 3. Esconde o Modal
            let modal = document.getElementById("modal-confirmacao");
            if(modal) modal.classList.remove("mostrar");

            // 4. Mostra o Toast de sucesso (a notificação que some sozinha)
            let toast = document.getElementById("toast-exclusao");
            if (toast) {
                toast.classList.add("mostrar");
                setTimeout(function() {
                    toast.classList.remove("mostrar");
                }, 3000);
            }

            // Limpa a memória
            indexParaDeletar = null;
        }
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

let btnCalcularComissao = document.getElementById("btn-calcular-comissao");

if (btnCalcularComissao) {
    btnCalcularComissao.addEventListener("click", function() {
        let dataInicio = document.getElementById("comissao-data-inicio").value;
        let dataFim = document.getElementById("comissao-data-fim").value;
        
        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione a Data Inicial e a Data Final.");
            return;
        }

        let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];

        // 1. CONTROLE DE META: Vendas feitas EXATAMENTE no mês filtrado
        let vendasDoMes = vendasSalvas.filter(function(venda) {
            return venda.data >= dataInicio && venda.data <= dataFim;
        });

        vendasDoMes.sort((a, b) => a.data.localeCompare(b.data));

        let totalVendidoMes = 0;
        let comissaoGeradaNoMes = 0;
        let comissaoRetidaDesteMes = 0;

        vendasDoMes.forEach(function(venda) {
            let valorVenda = venda.valor;
            let comissaoDestaVenda = 0;

            if (totalVendidoMes >= 7500) {
                comissaoDestaVenda = (valorVenda * 80) / 100;
            } else {
                if (totalVendidoMes + valorVenda <= 7500) {
                    comissaoDestaVenda = (valorVenda * 40) / 100;
                } else {
                    let valorAteMeta = 7500 - totalVendidoMes;
                    let valorAcimaMeta = valorVenda - valorAteMeta;
                    comissaoDestaVenda = ((valorAteMeta * 40) / 100) + ((valorAcimaMeta * 80) / 100);
                }
            }
            totalVendidoMes += valorVenda;
            comissaoGeradaNoMes += comissaoDestaVenda;

            let mesesDeCarencia = Number(venda.mesesDesconto) || 0;
            if (mesesDeCarencia > 0) {
                comissaoRetidaDesteMes += comissaoDestaVenda;
            }
        });

        // 2. COMISSÃO A RECEBER NO PERÍODO FILTRADO (Correção da linha do tempo e carência)
        
        let partesInicio = dataInicio.split('-').map(Number);
        let numInicio = partesInicio[0] * 12 + partesInicio[1]; 

        let partesFim = dataFim.split('-').map(Number);
        let numFim = partesFim[0] * 12 + partesFim[1];
        
        let comissaoReceberNesteMes = 0;

        vendasSalvas.forEach(function(venda) {
            let partesDataVenda = venda.data.split('-').map(Number);
            let anoVenda = partesDataVenda[0];
            let mesVenda = partesDataVenda[1];
            let mesesDeCarencia = Number(venda.mesesDesconto) || 0;

            let mesRecebimento = mesVenda + mesesDeCarencia + 1;
            let anoRecebimento = anoVenda;

            while (mesRecebimento > 12) {
                mesRecebimento -= 12;
                anoRecebimento += 1;
            }

            let numRecebimento = anoRecebimento * 12 + mesRecebimento;

            if (numRecebimento >= numInicio && numRecebimento <= numFim) {
                
                let vendasDaquelaEpoca = vendasSalvas.filter(function(v) {
                    let pV = v.data.split('-');
                    return Number(pV[0]) === anoVenda && Number(pV[1]) === mesVenda;
                });
                vendasDaquelaEpoca.sort((a, b) => a.data.localeCompare(b.data));
                
                let acumuladoAteEla = 0;
                let comissaoCalculadaDela = 0;

                for (let v of vendasDaquelaEpoca) {
                    let comissaoItem = 0;
                    if (acumuladoAteEla >= 7500) {
                        comissaoItem = (v.valor * 80) / 100;
                    } else {
                        if (acumuladoAteEla + v.valor <= 7500) {
                            comissaoItem = (v.valor * 40) / 100;
                        } else {
                            let p1 = 7500 - acumuladoAteEla;
                            let p2 = v.valor - p1;
                            comissaoItem = ((p1 * 40) / 100) + ((p2 * 80) / 100);
                        }
                    }
                    acumuladoAteEla += v.valor;

                    if (v.cliente === venda.cliente && v.data === venda.data && v.valor === venda.valor) {
                        comissaoCalculadaDela = comissaoItem;
                        break;
                    }
                }

                comissaoReceberNesteMes += comissaoCalculadaDela;
            }
        });

        // 3. INJETA NOS CARDS
        document.getElementById("res-total-vendido").innerText = `R$ ${totalVendidoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        
        let cardMeta = document.getElementById("res-meta-atingida");
        if (totalVendidoMes >= 7500) {
            cardMeta.innerText = "Sim! 🚀";
            cardMeta.style.color = "#28a745";
        } else {
            cardMeta.innerText = "Não 😢";
            cardMeta.style.color = "#dc3545";
        }

        document.getElementById("res-valor-retido").innerText = `R$ ${comissaoRetidaDesteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById("res-valor-comissao").innerText = `R$ ${comissaoReceberNesteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
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

        let dataAtual = new Date();
        let novoOnboarding = {
            id: Date.now(),
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

        document.getElementById("onb-cliente").value = "";
        document.getElementById("onb-data").value = "";
        document.getElementById("onb-planilha").checked = false;
        document.getElementById("onb-manual").checked = false;
        document.getElementById("onb-obs").value = "";

        carregarTabelaOnboarding();
    });
}

function carregarTabelaOnboarding() {
    let corpoTabela = document.getElementById("tabela-onboarding");
    if (!corpoTabela) return;

    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
    let mesAtual = new Date().getMonth();
    let anoAtual = new Date().getFullYear();

    corpoTabela.innerHTML = "";

    let listaFiltrada = listaOnboarding.filter(function(item) {
        let ehDoMesAtual = (item.mesCriacao === mesAtual && item.anoCriacao === anoAtual);
        let estaTudoConcluido = (item.planilhaOk === true && item.manualOk === true);

        if (ehDoMesAtual) {
            return true;
        } else {
            if (estaTudoConcluido) {
                return false;
            } else {
                return true;
            }
        }
    });

    if (listaFiltrada.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center;">Nenhuma implantação pendente no momento.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(function(item) {
        let dataFormatada = item.dataAgendamento ? item.dataAgendamento.split('-').reverse().join('/') : '-';
        
        let linha = document.createElement("tr");
        linha.innerHTML = `
            <td><strong>${item.cliente}</strong></td>
            <td>${dataFormatada}</td>
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
            <td style="font-size: 12px; color: #555; max-width: 200px;">${item.obs || '-'}</td>
            <td><button class="btn-editar" id="btn-edit-${item.id}">Editar</button></td>
        `;
        corpoTabela.appendChild(linha);

        // Forma segura para extensões do Chrome lidarem com o clique do botão Editar
        let btnEditarLocal = document.getElementById(`btn-edit-${item.id}`);
        if (btnEditarLocal) {
            btnEditarLocal.addEventListener("click", function() {
                abrirModalEdicao(item.id);
            });
        }
    });
}

function atualizarCheckOnboarding(id, qualCheckbox) {
    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
    let index = listaOnboarding.findIndex(item => item.id === id);
    
    if (index !== -1) {
        listaOnboarding[index][qualCheckbox] = !listaOnboarding[index][qualCheckbox];
        localStorage.setItem("listaOnboarding", JSON.stringify(listaOnboarding));
        carregarTabelaOnboarding(); 
    }
}

carregarTabelaOnboarding();

function preencherDropdownClientes() {
    let selectCliente = document.getElementById("onb-cliente");
    if (!selectCliente) return; 

    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    let nomesUnicos = [...new Set(vendasSalvas.map(venda => venda.cliente))];

    selectCliente.innerHTML = '<option value="">Selecione um cliente das vendas...</option>';

    nomesUnicos.forEach(function(nome) {
        let opcao = document.createElement("option");
        opcao.value = nome;
        opcao.textContent = nome;
        selectCliente.appendChild(opcao);
    });
}

preencherDropdownClientes();

// ==========================================
// LÓGICA DE EDIÇÃO DE ONBOARDING
// ==========================================

let idItemEditando = null;

function abrirModalEdicao(id) {
    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
    let item = listaOnboarding.find(obj => obj.id === id);

    if (item) {
        idItemEditando = id;
        
        document.getElementById("edit-onb-data").value = item.dataAgendamento || "";
        document.getElementById("edit-onb-obs").value = item.obs || "";

        let modalEdicao = document.getElementById("modal-editar-onb");
        if (modalEdicao) modalEdicao.classList.add("mostrar");
    }
}

let btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener("click", function() {
        let modalEdicao = document.getElementById("modal-editar-onb");
        if (modalEdicao) modalEdicao.classList.remove("mostrar");
        idItemEditando = null;
    });
}

let btnSalvarEdicao = document.getElementById("btn-salvar-edicao");
if (btnSalvarEdicao) {
    btnSalvarEdicao.addEventListener("click", function() {
        if (idItemEditando !== null) {
            let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
            let index = listaOnboarding.findIndex(obj => obj.id === idItemEditando);

            if (index !== -1) {
                listaOnboarding[index].dataAgendamento = document.getElementById("edit-onb-data").value;
                listaOnboarding[index].obs = document.getElementById("edit-onb-obs").value;

                localStorage.setItem("listaOnboarding", JSON.stringify(listaOnboarding));

                let modalEdicao = document.getElementById("modal-editar-onb");
                if (modalEdicao) modalEdicao.classList.remove("mostrar");
                
                idItemEditando = null;
                carregarTabelaOnboarding();

                let toast = document.getElementById("toast-onboarding");
                if (toast) {
                    toast.classList.add("mostrar");
                    setTimeout(function() {
                        toast.classList.remove("mostrar");
                    }, 3000);
                } else {
                    alert("Acompanhamento atualizado com sucesso!");
                }
            }
        }
    });
}