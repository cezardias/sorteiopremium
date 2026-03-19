import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const [companyName, setCompanyName] = React.useState("PREMIUM MULTIMARCAS");
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: "https://instagram.com",
    whatsapp: "https://wa.me"
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/public-settings');
        const result = await response.json();
        if (result.success && result.data) {
          if (result.data.footer_company) setCompanyName(result.data.footer_company);
          
          setSocialLinks({
            instagram: result.data.instagram_link || "https://instagram.com",
            whatsapp: result.data.whatsapp_number ? `https://wa.me/${result.data.whatsapp_number.replace(/\D/g, '')}` : "https://wa.me",
            whatsapp_group: result.data.whatsapp_group_url,
            helpdesk: result.data.helpdesk_url
          });
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-dark-secondary border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black italic tracking-widest text-white mb-2 uppercase">
              {companyName}
            </h3>
            <p className="text-primary font-bold uppercase tracking-tight text-sm">
              Realizando sonhos!
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href={socialLinks.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Instagram size={24} />
            </a>
            <a 
              href={socialLinks.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
            >
              <MessageCircle size={24} />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
            © {currentYear} Premium Multimarcas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
