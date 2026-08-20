import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonial() {
  const testimonials = [
    {
      quote:
        "I honestly didn’t expect it to fit this perfectly. The attention to detail is amazing, and you can tell it was made with so much care. I’ve gotten compliments every single time I wear it.",
      name: "Amara O.",
      designation: "Crochet Enthusiast",
      src: "https://res.cloudinary.com/u3kraw33/image/upload/v1787262072/beccas-knotique/images/testimonials/amara.jpg",
    },
    {
      quote:
        "I love how unique my piece feels. It’s not something you just see anywhere. The whole process was smooth, and she really listened to what I wanted.",
      name: "Chidinma E.",
      designation: "Style Influencer",
      src: "https://res.cloudinary.com/u3kraw33/image/upload/v1787262073/beccas-knotique/images/testimonials/chidinma.jpg",
    },
    {
      quote:
        "The quality? Top-notch. The comfort? Even better. You can tell it wasn’t rushed. It feels special, like something made just for me.",
      name: "Funke A. ",
      designation: "Fashion Lover",
      src: "https://res.cloudinary.com/u3kraw33/image/upload/v1787262074/beccas-knotique/images/testimonials/funke.jpg",
    },
    {
      quote:
        "I wasn’t even sure what I wanted at first, but she helped me figure it out. The final piece came out even better than I imagined. Definitely ordering again.",
      name: "Zainab K.",
      designation: "Craft Advocate",
      src: "https://res.cloudinary.com/u3kraw33/image/upload/v1787262077/beccas-knotique/images/testimonials/zainab.jpg",
    },
    {
      quote:
        "This is easily one of my favorite outfits right now. It fits so well and stands out in the best way. You can feel the effort that went into making it.",
      name: "Tolani S.",
      designation: "Trendsetter",
      src: "https://res.cloudinary.com/u3kraw33/image/upload/v1787262076/beccas-knotique/images/testimonials/tolani.jpg",
    },
  ];
  return (
    <>
      <div className="mt-5 h-screen">
        <div className="mx-auto h-0.5 w-full bg-linear-to-r from-transparent via-black/60 to-transparent"></div>
        <p className="mt-10 text-center text-4xl font-semibold">
          {" "}
          What our returning customers <br /> are saying...
        </p>
        <AnimatedTestimonials testimonials={testimonials} />
      </div>
    </>
  );
}
