import React from 'react';
import { Section } from '../types';
import { COLORS } from '../constants';

interface LegalSectionProps {
  activeTab: Section;
}

const LegalSection: React.FC<LegalSectionProps> = ({ activeTab }) => {
  
  const renderLegalNotice = () => (
    <div className="space-y-6 text-gray-300">
      <h2 className="text-3xl font-bold text-white mb-8">AVISO LEGAL</h2>
      
      <h3 className="text-xl font-bold text-white mt-6">1. Datos Identificativos</h3>
      <p>
        En cumprimento co deber de información recollido no artigo 10 da Lei 34/2002, do 11 de xullo, de Servizos da Sociedade da Información e do Comercio Electrónico, a continuación reflíctense os seguintes datos:
        <br/><br/>
        A empresa titular desta web é <strong>Alejandro Brey Pazos</strong> (en diante, "A Empresa"), con domicilio a estes efectos en Sequeiró, 18. Couso. A Estrada. 36682.
        <br/>
        Correo electrónico de contacto: info@ariala.gal.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">2. Usuarios</h3>
      <p>
        O acceso e/ou uso deste portal de A Riala Taberna atribúe a condición de USUARIO, que acepta, desde dito acceso e/ou uso, as Condicións Xerais de Uso aquí reflectidas.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">3. Propiedade Intelectual e Industrial</h3>
      <p>
        A Riala Taberna por si ou como cesionaria, é titular de todos os dereitos de propiedade intelectual e industrial da súa páxina web, así como dos elementos contidos na mesma (a título enunciativo: imaxes, son, audio, vídeo, software ou textos; marcas ou logotipos, combinacións de cores, estrutura e deseño, etc.).
        <br/><br/>
        Todos os dereitos reservados. Quedan expresamente prohibidas a reprodución, a distribución e a comunicación pública, incluída a súa modalidade de posta a disposición, da totalidade ou parte dos contidos desta páxina web, con fins comerciais, en calquera soporte e por calquera medio técnico, sen a autorización da Riala Taberna.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">4. Exclusión de Garantías e Responsabilidade</h3>
      <p>
        A Riala Taberna non se fai responsable, en ningún caso, dos danos e perdas de calquera natureza que puidesen ocasionar, a título enunciativo: erros ou omisións nos contidos, falta de dispoñibilidade do portal ou a transmisión de virus ou programas maliciosos nos contidos, malia adoptar todas as medidas tecnolóxicas necesarias para evitalo.
      </p>
    </div>
  );

  const renderPrivacyPolicy = () => (
    <div className="space-y-6 text-gray-300">
      <h2 className="text-3xl font-bold text-white mb-8">POLÍTICA DE PRIVACIDADE</h2>
      
      <p>
        Na Riala Taberna comprometémonos a protexer a privacidade dos nosos clientes e usuarios. Esta Política de Privacidade describe como recollemos, usamos e protexemos a túa información persoal.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">1. Responsable do Tratamento</h3>
      <p>
        Os datos de carácter persoal que nos proporciones serán tratados por <strong>Alejandro Brey Pazos</strong>, con domicilio a estes efectos en Sequeiró, 18. Couso. A Estrada. 36682.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">2. Finalidade do Tratamento</h3>
      <p>
        Tratamos a información que nos facilitan as persoas interesadas co fin de:
      </p>
      <ul className="list-disc list-inside ml-4 space-y-2">
        <li>Xestionar as reservas de mesa solicitadas a través da web.</li>
        <li>Tramitar as propostas de proxectos culturais e artísticos recibidos.</li>
        <li>Xestionar os procesos de selección de persoal (CVs).</li>
        <li>Responder a consultas ou dúbidas formuladas.</li>
      </ul>

      <h3 className="text-xl font-bold text-white mt-6">3. Lexitimación</h3>
      <p>
        A base legal para o tratamento dos teus datos é o <strong>consentimento</strong> que nos outorgas ao cubrir os formularios correspondentes e aceptar esta política, así como a execución da relación contractual no caso de reservas.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">4. Destinatarios</h3>
      <p>
        Os datos non se comunicarán a terceiros, agás por obriga legal.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">5. Dereitos</h3>
      <p>
        Tes dereito a obter confirmación sobre se na Riala Taberna estamos a tratar datos persoais que che concirnen. Podes exercer os teus dereitos de acceso, rectificación, supresión, limitación, portabilidade e oposición dirixíndote a info@ariala.gal.
      </p>
    </div>
  );

  const renderCookiesPolicy = () => (
    <div className="space-y-6 text-gray-300">
      <h2 className="text-3xl font-bold text-white mb-8">POLÍTICA DE COOKIES</h2>
      
      <p>
        Esta web utiliza cookies para mellorar a experiencia do usuario. A continuación, explicamos que son as cookies, que tipo de cookies utilizamos e como podes xestionalas.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">Que son as Cookies?</h3>
      <p>
        Unha cookie é un pequeno ficheiro de texto que se almacena no teu navegador cando visitas case calquera páxina web. A súa utilidade é que a web sexa capaz de lembrar a túa visita cando volvas navegar por esa páxina.
      </p>

      <h3 className="text-xl font-bold text-white mt-6">Cookies que utiliza esta web</h3>
      <ul className="list-disc list-inside ml-4 space-y-2">
        <li><strong>Cookies técnicas:</strong> Son aquelas necesarias para a navegación e o bo funcionamento da páxina web (ex. xestión de sesións, acceso a partes restrinxidas).</li>
        <li><strong>Cookies de análise:</strong> Permiten cuantificar o número de usuarios e realizar a medición e análise estatística da utilización que fan os usuarios do servizo.</li>
      </ul>

      <h3 className="text-xl font-bold text-white mt-6">Como desactivar as cookies?</h3>
      <p>
        Podes permitir, bloquear ou eliminar as cookies instaladas no teu equipo mediante a configuración das opcións do navegador instalado no teu ordenador:
      </p>
      <ul className="list-disc list-inside ml-4 space-y-2">
        <li>Chrome: Configuración - Privacidade e seguridade - Cookies.</li>
        <li>Firefox: Opcións - Privacidade e seguridade.</li>
        <li>Safari: Preferencias - Privacidade.</li>
      </ul>
      <p className="mt-4">
        Ten en conta que se desactivas as cookies, é posible que algunhas funcionalidades da web non funcionen correctamente.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-sm border border-gray-800 shadow-xl">
        {activeTab === Section.LEGAL && renderLegalNotice()}
        {activeTab === Section.PRIVACY && renderPrivacyPolicy()}
        {activeTab === Section.COOKIES && renderCookiesPolicy()}
      </div>
    </div>
  );
};

export default LegalSection;