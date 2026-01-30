import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

import {
  features,
  advantages,
  users,
  faqs,
  testimonials,
  brainToken,
} from '@/constant/landing-page';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export default function LandingPage() {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="mt-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl text-center w-full lg:w-[992px] text-blue-950 mb-12">
          Get Answers. Earn Tokens. Own Your Reputation.
        </h1>
        <div className="w-full md:w-[642px]">
          <Input
            placeholder="Search Your Question..."
            icon={Search}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-10 glass-background text-blue-950"
            iconClassName="text-blue-950"
          />
        </div>
        <Image
          src="/images/banner-image.png"
          alt="banner-image"
          width={612}
          height={450}
          className="mt-[-108px]"
        />
      </section>
      {/* Features Section */}
      <section className="w-full grid grid-cols-12">
        <Card className="col-span-12 xl:col-span-10 xl:col-start-2 w-full rounded-full flex items-center justify-center p-4">
          <div className="flex flex-row">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-row items-center gap-1"
              >
                <div className="flex flex-col items-center justify-center gap-1  md:w-28 xl:w-36">
                  <feature.icon className="lg:w-12 lg:h-12 text-blue-950" />
                  <h3 className="text-sm font-medium text-blue-950 text-center">{feature.title}</h3>
                </div>
                <div
                  className={`w-10 sm:w-12 md:w-16 lg:w-28 h-0.5 border-2 border-blue-950 border-dashed ${index === features.length - 1 ? 'hidden' : ''}`}
                />
              </div>
            ))}
          </div>
        </Card>
      </section>
      {/* Advantages Section */}
      <section className="w-full">
        <h2 className="text-[40px] text-center text-blue-950 mb-6">What BrainBase changes</h2>
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-10 md:col-span-5 !col-start-2">
            <h3 className="text-2xl font-semibold text-center mb-4">Today&apos;s Q&A Platforms</h3>
            <ul className="pl-6">
              {advantages.todaysqna.map((point, index) => (
                <li
                  key={index}
                  className="list-disc text-blue-950"
                >
                  {point}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="col-span-10 md:col-span-5 max-md:col-start-2">
            <h3 className="text-2xl font-semibold text-center mb-4">With BrainBase</h3>
            <ul className="pl-6">
              {advantages.brainbase.map((point, index) => (
                <li
                  key={index}
                  className="list-disc text-blue-950"
                >
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* BRAIN Token Section */}
      <section className="w-full">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/images/brain-coin.png"
              alt="brain-token"
              width={48}
              height={48}
            />
            <h2 className="text-[40px] text-blue-950">{brainToken.title}</h2>
          </div>
          <p className="text-lg text-blue-800 max-w-2xl mx-auto">{brainToken.subtitle}</p>
          <p className="text-sm text-slate-600 max-w-3xl mx-auto mt-2">{brainToken.description}</p>
        </div>

        {/* Token Features */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {brainToken.features.map((feature, index) => (
            <Card
              key={index}
              className="col-span-6 md:col-span-3 p-4 text-center"
            >
              <feature.icon className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <h4 className="text-lg font-semibold text-blue-950 mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-12">
          <Card className="col-span-12 md:col-span-8 md:col-start-3 p-6">
            <h3 className="text-2xl font-semibold text-center text-blue-950 mb-6">
              How BRAIN Works
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {brainToken.howItWorks.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-3">
                    {step.step}
                  </div>
                  <h4 className="text-lg font-semibold text-blue-950">{step.title}</h4>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
      {/* Users Section */}
      <section className="w-full grid grid-cols-12 items-center">
        <div className="col-span-12 md:col-span-6">
          <Image
            src="/images/users-image.png"
            alt="users-image"
            width={660}
            height={455}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <h2 className="text-[40px] text-blue-950 mb-6">Built for curious learners and experts</h2>
          <div className="grid grid-cols-6 gap-6">
            {users.map((user, index) => (
              <Card
                key={index}
                className="col-span-3 flex flex-col items-center justify-center gap-4 p-4"
              >
                <Image
                  src={user.image}
                  alt={`${user.category}-image`}
                  width={224}
                  height={160}
                />
                <h3 className="text-xl text-center font-semibold text-blue-950">{user.category}</h3>
                <ul className="pl-4">
                  {user.description.map((desc, descIndex) => (
                    <li
                      key={descIndex}
                      className="list-disc text-blue-950"
                    >
                      {desc}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={'outline'}
                  onClick={() => router.push('/auth/sign-in')}
                >
                  {user.category === 'Learners' ? 'Ask a Question' : 'Start Answering'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full">
        <h2 className="text-[40px] text-center text-blue-950 mb-6">Testimonials</h2>
        <div>
          {/* Row 1 - scroll left */}
          <div className="relative overflow-hidden group">
            <div className="flex w-[200%] animate-scroll-left gap-6 group-hover:[animation-play-state:paused] pb-6">
              {[...testimonials.slice(0, 5), ...testimonials.slice(0, 5)].map(
                (testimonial, index) => (
                  <Card
                    key={`row1-${index}-${testimonial.name}`}
                    className="flex-shrink-0 w-[318px] flex flex-col justify-between p-4"
                  >
                    <p className="text-sm text-blue-950 mb-3">“{testimonial.comment}”</p>
                    <div className="flex flex-row gap-2">
                      <div>
                        <Image
                          src={testimonial.image}
                          alt={`${testimonial.name}-image`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full bg-blue-400"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-blue-950">{testimonial.name}</p>
                        <p className="text-xs text-blue-700">{testimonial.role}</p>
                      </div>
                    </div>
                  </Card>
                ),
              )}
            </div>
          </div>

          {/* Row 2 - scroll right */}
          <div className="relative overflow-hidden group">
            <div className="flex w-[200%] animate-scroll-right gap-6 group-hover:[animation-play-state:paused] pb-6">
              {[...testimonials.slice(5, 10), ...testimonials.slice(5, 10)].map(
                (testimonial, index) => (
                  <Card
                    key={`row2-${index}-${testimonial.name}`}
                    className="flex-shrink-0 w-[318px] flex flex-col justify-between p-4"
                  >
                    <p className="text-sm text-blue-950 mb-3">“{testimonial.comment}”</p>
                    <div className="flex flex-row gap-2">
                      <Image
                        src={testimonial.image}
                        alt={`${testimonial.name}-image`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full bg-blue-400"
                      />
                      <div>
                        <p className="text-lg font-semibold text-blue-950">{testimonial.name}</p>
                        <p className="text-xs text-blue-700">{testimonial.role}</p>
                      </div>
                    </div>
                  </Card>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQS Section */}
      <section className="w-full grid grid-cols-12 items-end">
        <div className="col-span-12 md:col-span-6 pb-6">
          <h2 className="text-[40px] text-blue-950 mb-6">FAQs</h2>
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-4"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
              >
                <AccordionTrigger className="text-blue-950 text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="col-span-12 md:col-span-6">
          <Image
            src="/images/faqs-image.png"
            alt="users-image"
            width={660}
            height={455}
          />
        </div>
      </section>
    </div>
  );
}
