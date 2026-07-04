import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  // Estado local para guardar as diárias vindas da API
  const [diarias, setDiarias] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Mensagem de erro global na interface (Tratamento de Exceções no Front)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Estados locais para controlar os campos do formulário de cadastro
  const [destino, setDestino] = useState('');
  const [cargo, setCargo] = useState('');
  const [servidorId, setServidorId] = useState('');
  const [temPernoite, setTemPernoite] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Função para buscar as diárias da API (CSR)
  const buscarDiarias = () => {
    setCarregando(true);
    setMensagemErro(null);
    axios.get('http://localhost:3000/diarias?page=1&limit=10')
      .then((resposta) => {
        setDiarias(resposta.data.dados); 
        setCarregando(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar diárias do NestJS:", erro);
        setMensagemErro("Não foi possível carregar as diárias. O servidor backend está rodando?");
        setCarregando(false);
      });
  };

  // O useEffect roda assim que a SPA é carregada no navegador
  useEffect(() => {
    buscarDiarias();
  }, []);

  // Função para lidar com o envio do formulário (POST)
  const handleCadastrarDiaria = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensagemErro(null);

    // Validação simples antes de enviar no front
    if (!destino.trim() || !cargo.trim() || !servidorId.trim()) {
      setMensagemErro("Por favor, preencha o destino, o cargo e o ID do servidor.");
      setEnviando(false);
      return;
    }

    const novaDiaria = {
      destino,
      cargo, // Enviando o cargo exigido pelo DTO do NestJS
      temPernoite,
      servidorId: Number(servidorId) // Garante que vai como número para o NestJS/Prisma
    };

    try {
      // Dispara o POST para o backend
      await axios.post('http://localhost:3000/diarias', novaDiaria);
      
      // Limpa todos os campos do formulário após o sucesso
      setDestino('');
      setCargo('');
      setTemPernoite(false);
      setServidorId('');
      
      // Atualiza a tabela chamando a listagem novamente
      buscarDiarias();
      alert("Diária cadastrada com sucesso!");
    } catch (erro: any) {
      console.error("Erro ao cadastrar diária:", erro);
      // Captura a mensagem vinda do ValidationPipe do NestJS se houver
      const mensagemDoBack = erro.response?.data?.message;
      setMensagemErro(
        Array.isArray(mensagemDoBack) 
          ? mensagemDoBack.join(', ') 
          : mensagemDoBack || "Erro ao tentar salvar a diária. Verifique os dados ou o ID do servidor."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>🏛️ Sistema de Gestão de Diárias (SGDOP)</h1>
      <p style={{ color: '#666' }}>Interface SPA renderizada no cliente (CSR) consumindo API NestJS.</p>
      
      {/* Exibição de Erros Global na Interface (Critério de Excelência/Conceito A) */}
      {mensagemErro && (
        <div style={{ padding: '15px', backgroundColor: '#ffdde1', color: '#c0392b', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ebccd1' }}>
          <strong>⚠️ Atenção:</strong> {mensagemErro}
        </div>
      )}

      {/* --- SEÇÃO DO FORMULÁRIO DE CADASTRO --- */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        <h3>➕ Solicitar Nova Diária</h3>
        <form onSubmit={handleCadastrarDiaria} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Destino:</label>
            <input 
              type="text" 
              value={destino} 
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ex: Porto Alegre / RS"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Cargo do Beneficiário:</label>
            <input 
              type="text" 
              value={cargo} 
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Analista, Diretor"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '180px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>ID do Servidor Solicitante:</label>
            <input 
              type="number" 
              value={servidorId} 
              onChange={(e) => setServidorId(e.target.value)}
              placeholder="Ex: 1"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '150px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '35px' }}>
            <input 
              type="checkbox" 
              id="pernoite"
              checked={temPernoite} 
              onChange={(e) => setTemPernoite(e.target.checked)}
            />
            <label htmlFor="pernoite" style={{ cursor: 'pointer' }}>Possui Pernoite?</label>
          </div>

          <button 
            type="submit" 
            disabled={enviando}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: enviando ? '#95a5a6' : '#2ecc71', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: enviando ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {enviando ? 'Gravando...' : 'Salvar Diária'}
          </button>
        </form>
      </div>

      {/* --- SEÇÃO DA TABELA DE DIÁRIAS --- */}
      <h3>📋 Listagem de Diárias Cadastradas</h3>
      {carregando ? (
        <h4>🔄 Carregando Diárias da API Pública (ou Cache)...</h4>
      ) : (
        <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
              <th>ID</th>
              <th>Destino</th>
              <th>Pernoite?</th>
              <th>Valor Total</th>
              <th>Servidor Solicitante</th>
            </tr>
          </thead>
          <tbody>
            {diarias.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#7f8c8d' }}>Nenhuma diária cadastrada no momento.</td>
              </tr>
            ) : (
              diarias.map((diaria) => (
                <tr key={diaria.id} style={{ textAlign: 'center' }}>
                  <td><strong>{diaria.id}</strong></td>
                  <td>{diaria.destino}</td>
                  <td>{diaria.temPernoite ? '✅ Sim' : '❌ Não'}</td>
                  <td style={{ fontWeight: 'bold', color: '#27ae60' }}>R$ {diaria.valorTotal.toFixed(2)}</td>
                  <td>{diaria.servidor?.nome || `⚠️ ID ${diaria.servidorId} (Não mapeado)`}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}