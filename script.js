// 1. O MOTOR MATEMÁTICO
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

        let dadosDaVenda = {
            cliente: campoCliente.value,
            data: campoData.value,
            valor: Number(campoVenda.value),
            mesesDesconto: Number(campoDesconto.value)
        };

        let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
        vendasSalvas.push(dadosDaVenda);
        localStorage.setItem("listaVendas", JSON.stringify(vendasSalvas));

        let toast = document.getElementById("toast-sucesso");
        if (toast) {
            toast.classList.add("mostrar");
            setTimeout(function() {
                toast.classList.remove("mostrar");
            }, 3000);
        } else {
            alert("Venda registrada com sucesso!");
        }

        atualizarTabela();
        atualizarGrafico();
    });
}
    
function atualizarTabela(){
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    let vendasCopia = [...vendasSalvas].reverse(); 

    let corpoTabela = document.getElementById("tabela-ultimas-vendas");
    let cardAcumulado = document.getElementById("card-acumulado");
    let cardMedia = document.getElementById("card-media");
    let cardTotal = document.getElementById("card-total");

    let valorAcumulado = 0;
    let totalRegistros = vendasSalvas.length;

    if (corpoTabela) {
        corpoTabela.innerHTML =""; 
        vendasCopia.forEach(function(venda) {
            valorAcumulado += venda.valor;
            let linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${venda.cliente}</td>
                <td>R$ ${venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            `;
            corpoTabela.appendChild(linha);
        });
    } else {
        vendasSalvas.forEach(function(venda) {
            valorAcumulado += venda.valor;
        });
    }

    let mediaVendas = totalRegistros > 0 ? valorAcumulado / totalRegistros : 0;

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

atualizarTabela();

let meuGrafico = null;

function atualizarGrafico() {
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    let ctx = document.getElementById('graficoVendas');

    if (!ctx) return;

    let labels = vendasSalvas.map(v => v.cliente);
    let dadosValores = vendasSalvas.map(v => v.valor);

    if (meuGrafico) {
        meuGrafico.destroy();
    }

    meuGrafico = new Chart(ctx, {
        type: 'bar',
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
    if (!corpoTabela) return; 

    let vendas = vendasParaMostrar || JSON.parse(localStorage.getItem("listaVendas")) || [];
    corpoTabela.innerHTML = "";

    if (vendas.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhuma venda encontrada para este período.</td></tr>`;
        return;
    }

    vendas.forEach(function(venda, index) {
        let dataFormatada = venda.data.split('-').reverse().join('/');
        let linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${venda.cliente}</td>
            <td>${dataFormatada}</td>
            <td>R$ ${venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>${venda.mesesDesconto}</td>
            <td><button class="btn-excluir" onclick="deletarVenda(${index})">Excluir</button></td>
        `;
        corpoTabela.appendChild(linha);
    });
}

let indexParaDeletar = null; 

function deletarVenda(index) {
    indexParaDeletar = index;
    let modal = document.getElementById("modal-confirmacao");
    if(modal) modal.classList.add("mostrar");
}

let btnCancelarExclusao = document.getElementById("btn-cancelar-exclusao");
let btnConfirmarExclusao = document.getElementById("btn-confirmar-exclusao");

if (btnCancelarExclusao) {
    btnCancelarExclusao.addEventListener("click", function() {
        let modal = document.getElementById("modal-confirmacao");
        if(modal) modal.classList.remove("mostrar");
        indexParaDeletar = null;
    });
}

if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener("click", function() {
        if (indexParaDeletar !== null) {
            let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
            vendasSalvas.splice(indexParaDeletar, 1);
            localStorage.setItem("listaVendas", JSON.stringify(vendasSalvas));

            if (typeof carregarConsultaVendas === "function") carregarConsultaVendas();
            if (typeof atualizarTabela === "function") atualizarTabela();
            if (typeof atualizarGrafico === "function") atualizarGrafico();

            let modal = document.getElementById("modal-confirmacao");
            if(modal) modal.classList.remove("mostrar");

            let toast = document.getElementById("toast-exclusao");
            if (toast) {
                toast.classList.add("mostrar");
                setTimeout(function() {
                    toast.classList.remove("mostrar");
                }, 3000);
            }
            indexParaDeletar = null;
        }
    });
}

let btnFiltrar = document.getElementById("btn-filtrar");
if (btnFiltrar) {
    btnFiltrar.addEventListener("click", function() {
        let dataInicio = document.getElementById("data-inicio").value;
        let dataFim = document.getElementById("data-fim").value;
        let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];

        if (!dataInicio || !dataFim) {
            alert("Por favor, selecione a Data Inicial e a Data Final.");
            return;
        }

        let vendasFiltradas = vendasSalvas.filter(function(venda) {
            return venda.data >= dataInicio && venda.data <= dataFim;
        });

        carregarConsultaVendas(vendasFiltradas);
    });
}

let btnLimpar = document.getElementById("btn-limpar");
if (btnLimpar) {
    btnLimpar.addEventListener("click", function() {
        document.getElementById("data-inicio").value = "";
        document.getElementById("data-fim").value = "";
        carregarConsultaVendas(); 
    });
}

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
            onboardingRealizado: false, // <--- GARANTE QUE JÁ NASCE FALSE CORRETAMENTE
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
        if (item.onboardingRealizado === true) {
            return false; 
        }

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
        corpoTabela.innerHTML = `<tr><td colspan="7" style="padding: 20px; text-align: center;">Nenhuma implantação pendente no momento.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(function(item) {
        let dataFormatada = item.dataAgendamento ? item.dataAgendamento.split('-').reverse().join('/') : '-';
        
        let linha = document.createElement("tr");
        linha.innerHTML = `
            <td><strong>${item.cliente}</strong></td>
            <td>${dataFormatada}</td>
            <td>
                <input type="checkbox" class="check-tabela" id="check-planilha-${item.id}" 
                ${item.planilhaOk ? "checked" : ""}>
            </td>
            <td>
                <input type="checkbox" class="check-tabela" id="check-manual-${item.id}" 
                ${item.manualOk ? "checked" : ""}>
            </td>
            <td style="font-size: 12px; color: #555; max-width: 200px;">${item.obs || '-'}</td>
            <td>
                <input type="checkbox" class="check-tabela" id="check-realizado-${item.id}" style="accent-color: #007BFF;"
                ${item.onboardingRealizado ? "checked" : ""}>
            </td>
            <td><button class="btn-editar" id="btn-edit-${item.id}">Editar</button></td>
        `;
        corpoTabela.appendChild(linha);

        // Evento seguro para o checkbox "Planilha OK?"
        let chkPlanilha = document.getElementById(`check-planilha-${item.id}`);
        if (chkPlanilha) {
            chkPlanilha.addEventListener("change", function() {
                atualizarCheckOnboarding(item.id, 'planilhaOk', this);
            });
        }

        // Evento seguro para o checkbox "Manual OK?"
        let chkManual = document.getElementById(`check-manual-${item.id}`);
        if (chkManual) {
            chkManual.addEventListener("change", function() {
                atualizarCheckOnboarding(item.id, 'manualOk', this);
            });
        }

        // Evento seguro para o checkbox "Onboarding Realizado"
        let chkRealizado = document.getElementById(`check-realizado-${item.id}`);
        if (chkRealizado) {
            chkRealizado.addEventListener("change", function() {
                atualizarCheckOnboarding(item.id, 'onboardingRealizado', this);
            });
        }

        // Evento seguro para o botão "Editar"
        let btnEditarLocal = document.getElementById(`btn-edit-${item.id}`);
        if (btnEditarLocal) {
            btnEditarLocal.addEventListener("click", function() {
                abrirModalEdicao(item.id);
            });
        }
    });
}

function atualizarCheckOnboarding(id, qualCheckbox, elementoCheckbox) {
    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];
    let index = listaOnboarding.findIndex(item => item.id === id);
    
    if (index !== -1) {
        listaOnboarding[index][qualCheckbox] = elementoCheckbox.checked;
        localStorage.setItem("listaOnboarding", JSON.stringify(listaOnboarding));
        carregarTabelaOnboarding(); 
    }
}

carregarTabelaOnboarding();

function preencherDropdownClientes() {
    let selectCliente = document.getElementById("onb-cliente");
    if (!selectCliente) return; 

    // 1. Busca as vendas salvas e a lista de onboarding
    let vendasSalvas = JSON.parse(localStorage.getItem("listaVendas")) || [];
    let listaOnboarding = JSON.parse(localStorage.getItem("listaOnboarding")) || [];

    // 2. Descobre quais clientes JÁ tiveram o onboarding concluído (realizado = true)
    let clientesConcluidos = listaOnboarding
        .filter(item => item.onboardingRealizado === true)
        .map(item => item.cliente);

    // 3. Pega os nomes únicos de todas as vendas
    let nomesUnicos = [...new Set(vendasSalvas.map(venda => venda.cliente))];

    // 4. Filtra a lista: só mantém os clientes que NÃO estão na lista de concluídos
    let nomesDisponiveis = nomesUnicos.filter(nome => !clientesConcluidos.includes(nome));

    // 5. Limpa o select e preenche apenas com quem falta fazer o onboarding
    selectCliente.innerHTML = '<option value="">Selecione um cliente das vendas...</option>';

    nomesDisponiveis.forEach(function(nome) {
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