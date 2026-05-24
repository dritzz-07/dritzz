import { Star } from 'lucide-react';

const reviews = [
  {
    stars: 5,
    text: "Absolutely loved the service! They arrived right on time and my car looked brand new. The interior detailing was exceptional.",
    author: "Ravi Shankar",
    location: "Banjara Hills, Hyderabad"
  },
  {
    stars: 5,
    text: "Finally a car wash service that actually comes to you. Booked online in 2 minutes, paid via UPI, and the guys did an amazing job.",
    author: "Priya Reddy",
    location: "Madhapur, Hyderabad"
  },
  {
    stars: 4,
    text: "Great value for money. Booked the Elite package for my SUV. The team was professional and thorough. Will definitely rebook.",
    author: "Kiran Mehta",
    location: "Kondapur, Hyderabad"
  }
];

export default function Testimonials() {
  return (
    <section className="bg-black px-6 md:px-16 py-24 border-t border-white/5">
      <div className="section-label">What Customers Say</div>
      <h2 className="section-title">REVIEWS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {reviews.map((review, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-2xl shadow-sm">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`w-3 h-3 ${idx < review.stars ? 'fill-white text-white' : 'text-neutral-800'}`} 
                />
              ))}
            </div>
            <p className="text-neutral-400 italic mb-10 leading-relaxed text-[0.95rem]">
              "{review.text}"
            </p>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">{review.author}</div>
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-2 font-bold">{review.location}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
