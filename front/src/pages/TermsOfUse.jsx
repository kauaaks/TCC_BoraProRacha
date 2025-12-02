import { useNavigate } from "react-router-dom";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex justify-center items-start p-10">
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow">

        <h1 className="text-2xl font-bold mb-2">Termos de Uso</h1>

        <h2 className="text-xl font-semibold mt-4 mb-2">1. Introdução</h2>
        <p>
          Bem-vindo ao <strong>BoraProRacha</strong>. Estes Termos de Uso constituem um contrato legal entre você, usuário, e a plataforma <strong>BoraProRacha</strong>, regulamentando o acesso e utilização de nossos serviços. Ao utilizar a plataforma, você concorda com todas as condições aqui descritas.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">2. Objetivo</h2>
        <p>
          O objetivo destes Termos de Uso é definir regras de uso, direitos e responsabilidades tanto do usuário quanto da plataforma, garantindo uma experiência segura, organizada e em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">3. Uso do Serviço</h2>
        <p>
          Você concorda em utilizar a plataforma apenas para fins legais e de acordo com as normas estabelecidas neste documento. É proibido:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Utilizar a plataforma para praticar atos ilícitos ou contrários à legislação vigente;</li>
          <li>Compartilhar conteúdo ofensivo, discriminatório, difamatório ou que viole direitos de terceiros;</li>
          <li>Tentar acessar contas de outros usuários sem autorização;</li>
          <li>Modificar, distribuir ou reproduzir de forma não autorizada qualquer recurso da plataforma.</li>
        </ul>
        <p>O uso da plataforma deve respeitar as regras de conduta, mantendo um ambiente seguro e saudável para todos os usuários.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">4. Direitos Autorais e Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo disponibilizado na plataforma, incluindo textos, imagens, design, logos, ícones, software e códigos, é de propriedade exclusiva do <strong>BoraProRacha</strong> ou de seus licenciadores. É proibido copiar, reproduzir, modificar, distribuir ou criar obras derivadas sem autorização expressa da plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">5. Limitação de Responsabilidade</h2>
        <p>
          O <strong>BoraProRacha</strong> se esforça para garantir a disponibilidade, segurança e precisão das informações, mas não se responsabiliza por:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Danose diretos ou indiretos decorrentes do uso da plataforma;</li>
          <li>Perda de dados ou interrupções temporárias do serviço;</li>
          <li>Condutas de terceiros ou ações externas à plataforma.</li>
        </ul>
        <p>O usuário reconhece que utiliza o serviço por sua própria conta e risco.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">6. Suspensão ou Encerramento de Contas</h2>
        <p>
          A plataforma reserva-se o direito de suspender ou encerrar contas de usuários que:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Descumpram qualquer termo destes Termos de Uso;</li>
          <li>Pratiquem atos ilícitos ou prejudiciais a outros usuários;</li>
          <li>Violarem direitos de propriedade intelectual da plataforma ou de terceiros.</li>
        </ul>
        <p>O encerramento de contas não exime o usuário de responsabilidades legais ou obrigações financeiras pendentes.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">7. Política de Pagamentos</h2>
        <p>
          Se aplicável, os serviços pagos da plataforma seguem as condições descritas:
        </p>
        <ul className="list-disc list-inside mb-2">
          <li>Pagamentos são processados de forma segura e transparente, por meio da respectiva loja de aplicativos;</li>
          <li>Não há reembolso para assinaturas ou serviços consumidos, salvo em casos previstos em lei;</li>
          <li>O usuário é responsável por manter informações de pagamento atualizadas e corretas.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">8. Proteção de Dados</h2>
        <p>
          Todos os dados pessoais coletados são tratados de acordo com a <strong>Política de Privacidade</strong> da plataforma e em conformidade com a LGPD. O usuário tem direito a acessar, corrigir ou solicitar exclusão de seus dados pessoais, bem como revogar consentimentos previamente concedidos.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">9. Alterações dos Termos</h2>
        <p>
          O <strong>BoraProRacha</strong> pode atualizar estes Termos de Uso periodicamente. Mudanças relevantes serão comunicadas e os usuários deverão concordar com os novos termos para continuar utilizando a plataforma.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">10. Contato</h2>
        <p>
          Em caso de dúvidas sobre estes Termos de Uso ou sobre a plataforma, você pode entrar em contato pelo e-mail: <strong>contato@boraproracha.com.br</strong>.
        </p>

        {/* Botão Voltar */}
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
