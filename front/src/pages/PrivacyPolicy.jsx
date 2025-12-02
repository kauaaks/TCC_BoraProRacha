import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex justify-center items-start p-10">
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow">

        <h1 className="text-2xl font-bold mb-4">Política de Privacidade</h1>

        <p className="mb-4 font-medium text-gray-700">
          Ao acessar nosso site ou baixar o aplicativo <strong>BoraProRacha</strong>, você concorda com esta Política de Privacidade e com o tratamento dos seus dados pessoais, de acordo com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018).
        </p>

        <p>
          A sua privacidade é muito importante para nós. Esta Política de Privacidade descreve como o <strong>BoraProRacha</strong> coleta, utiliza, armazena e protege os seus dados pessoais.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">1. Coleta de Dados</h2>
        <p>Coletamos apenas os dados necessários para o funcionamento da plataforma, incluindo:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Informações de cadastro: nome, e-mail, nome de usuário;</li>
          <li>Informações de perfil: avatar, dados do time e cargos;</li>
          <li>Dados de participação: histórico de jogos, convites aceitos e pagamentos;</li>
          <li>Dados técnicos: IP, tipo de navegador e informações de dispositivo para melhoria da plataforma.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">2. Uso dos Dados</h2>
        <p>Seus dados são utilizados para:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Permitir o cadastro e login de usuários;</li>
          <li>Gerenciar times, jogos, convites e pagamentos;</li>
          <li>Enviar notificações e atualizações relevantes;</li>
          <li>Melhorar a experiência e segurança do sistema.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">3. Compartilhamento de Dados</h2>
        <p>Não compartilhamos seus dados pessoais com terceiros para fins comerciais. Compartilhamentos podem ocorrer apenas quando:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Exigido por lei ou ordem judicial;</li>
          <li>Necessário para prestação de serviços essenciais, como processamento de pagamentos;</li>
          <li>Autorizado por você previamente.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">4. Segurança dos Dados</h2>
        <p>Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, vazamentos ou alterações indevidas. O acesso aos dados pessoais é restrito apenas a pessoas autorizadas.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">5. Direitos do Usuário</h2>
        <p>Em conformidade com a LGPD, você tem direito de:</p>
        <ul className="list-disc list-inside mb-2">
          <li>Acessar e corrigir seus dados pessoais;</li>
          <li>Solicitar a exclusão de seus dados;</li>
          <li>Revogar consentimentos concedidos;</li>
          <li>Solicitar portabilidade dos dados para outro serviço;</li>
          <li>Obter informações sobre o compartilhamento de seus dados.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">6. Contato</h2>
        <p>Em caso de dúvidas sobre esta política ou sobre seus dados pessoais, você pode entrar em contato pelo e-mail: <strong>contato@boraproracha.com.br</strong>.</p>

        <p className="mt-4 text-gray-500 text-sm">
          Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que revise esta página regularmente.
        </p>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
