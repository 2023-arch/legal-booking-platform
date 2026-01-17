"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "How do I choose the right lawyer?",
        answer: "You can search by specialization (e.g., Divorce, Property) and location. Review lawyer profiles, including their experience, client ratings, and consultation fees. The 'AI Summary' feature also helps match you with relevant experts."
    },
    {
        question: "Is the consultation fee refundable?",
        answer: "If a lawyer rejects your booking request or if you cancel significantly in advance (as per our cancellation policy), you will receive a full refund. Refunds are typically processed within 5-7 working days."
    },
    {
        question: "Is my consultation confidential?",
        answer: "Absolutely. All video and audio consultations are encrypted, and we adhere to strict privacy policies. Your case details are shared only with the lawyer you book."
    },
    {
        question: "Can I consult a lawyer from another city?",
        answer: "Yes! Our platform connects you with lawyers across India. You can book video consultations regardless of your location. For court representation, we recommend choosing a lawyer practicing in your jurisdiction."
    },
    {
        question: "What documents do I need for the consultation?",
        answer: "It helps to have any relevant documents (contracts, notices, court orders) ready. You can also upload them securely before the consultation starts so the lawyer can review them."
    }
];

export default function FAQSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-slate-600">
                        Common questions about finding and booking legal help.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-left text-lg font-medium text-slate-900">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed text-base">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
