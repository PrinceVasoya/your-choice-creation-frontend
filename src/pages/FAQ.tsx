import { motion } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Package, Truck, RotateCcw, CreditCard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/5 text-primary rounded-lg">
            <HelpCircle size={20} />
          </div>
          <span className="font-bold text-gray-900">{question}</span>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-8 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function FAQ() {
  const faqs = [
    {
      question: "How do I upload a photo for personalization?",
      answer: "You can upload photos directly on the product page using the 'Upload Your Photo' section. We recommend using high-quality JPG or PNG images for the best results."
    },
    {
      question: "What is your typical delivery time?",
      answer: "Standard delivery takes 3-5 business days. For cakes and fresh flowers, we offer same-day delivery in select metropolitan areas if the order is placed before 12 PM."
    },
    {
      question: "Can I cancel my order?",
      answer: "Since personalized gifts are custom-made, cancellations are only possible within 2 hours of placing the order. After that, the production process usually begins."
    },
    {
      question: "Do you offer cash on delivery?",
      answer: "No, we only accept online payments via Razorpay (including cards, UPI, Netbanking, etc.) to ensure secure, instant transactions and seamless order confirmation."
    },
    {
      question: "Is my photo used for any other purpose?",
      answer: "Absolutely not. Your privacy is our priority. Photos uploaded for personalization are strictly used for your order and are deleted from our servers after fulfillment."
    }
  ];

  return (
    <div className="bg-secondary min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-4 mb-20">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Help Center</span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-gray-500 font-sans max-w-xl mx-auto">Everything you need to know about our products and services.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <FAQItem {...faq} />
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
           {[
             { icon: <Truck />, title: "Track Order", p: "Live updates on your gift's journey." },
             { icon: <RotateCcw />, title: "Easy Returns", p: "7-day hassle-free return policy." },
             { icon: <ShieldCheck />, title: "Secure Pay", p: "100% protected payment gateway." }
           ].map((item, i) => (
             <div key={i} className="bg-white p-8 rounded-[2rem] text-center space-y-4 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">{item.icon}</div>
                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">{item.title}</h4>
                <p className="text-gray-500 text-xs">{item.p}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
