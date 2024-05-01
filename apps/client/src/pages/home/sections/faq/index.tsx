/* eslint-disable lingui/text-restrictions */
/* eslint-disable lingui/no-unlocalized-strings */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";

const Question1 = () => (
  <AccordionItem value="1">
    <AccordionTrigger className="text-left text-base">
    How can I use Death Resume for free?
    </AccordionTrigger>
    <AccordionContent className="max-w-none dark:prose-invert text-base">
      <p>
      You only need to sign in to use Death Resume for free.
      </p>
    </AccordionContent>
  </AccordionItem>
);

const Question2 = () => (
  <AccordionItem value="2">
    <AccordionTrigger className="text-left text-base">
    How do I cancel, downgrade, or delete my account?
    </AccordionTrigger>
    <AccordionContent className="max-w-none dark:prose-invert text-base">
      <p>
      You can perform any of these actions at your convenience through your user panel.
      </p>
    </AccordionContent>
  </AccordionItem>
);

const Question3 = () => (
  <AccordionItem value="3">
    <AccordionTrigger className="text-left text-base">
    Can I download my resume?
    </AccordionTrigger>
    <AccordionContent className="max-w-none dark:prose-invert text-base">
      <p>
      Yes, certainly.
      </p>
    </AccordionContent>
  </AccordionItem>
);

const Question4 = () => {
  return (
    <AccordionItem value="4">
      <AccordionTrigger className="text-left text-base">
      How do I share my resume?
      </AccordionTrigger>
      <AccordionContent className="max-w-none dark:prose-invert text-base">
        <p>
        Once your resume is ready, you can utilize Death Resume to share a free online link to it. By default, your materials are private and will only be shared if you choose to utilize our sharing features. Additionally, you can effortlessly download a PDF version of your resume to save and share with employers.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

const Question5 = () => (
  <AccordionItem value="5">
    <AccordionTrigger className="text-left text-base">
    How can I customize my resume?
    </AccordionTrigger>
    <AccordionContent className="max-w-none dark:prose-invert text-base">
      <p>
      Our resume templates are designed to adapt to your content and look great across all designs. You can customize nearly every aspect of your resume.
      </p>
    </AccordionContent>
  </AccordionItem>
);

const Question6 = () => (
  <AccordionItem value="6">
    <AccordionTrigger className="text-left text-base">
    Will you get me a job?
    </AccordionTrigger>
    <AccordionContent className="max-w-none dark:prose-invert text-base">
      <p>
      Not directly, but by using our resume tools, you will likely increase your chances of securing a job on your own.
      </p>
    </AccordionContent>
  </AccordionItem>
);

export const FAQSection = () => (
  <section id="faq" className="container relative grid grid-cols-1 lg:grid-cols-3 gap-4 py-12 sm:py-16 text-violet dark:text-white">
    <div className="col-span-1">
      <img src="/deathresume/client/logo/logo-picture.png" alt="Death Resume" className="h-full w-70 object-cover py-16 lg:py-24"/>
    </div>
    <div className="col-span-2">
     
      <div className="text-center lg:px-8">
        <p className="text-4xl font-extrabold">Death FAQ</p>
        <div className="px-4">
          <div>Sometimes even Death</div>
          <div className="px-2">have to give a FAQ</div>          
        </div>

      </div>
      <Accordion collapsible type="single">
        <Question1 />
        <Question2 />
        <Question3 />
        <Question4 />
        <Question5 />
        <Question6 />
      </Accordion>
    </div>
  </section>
);
