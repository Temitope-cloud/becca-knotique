import mongoose from "mongoose";

const cityList = (cities) => [...cities, "Other locations in this state"];

const zones = [
  { name: "Challenge & Ring Road, Ibadan", states: ["Oyo"], cities: ["Challenge", "Orita Challenge", "Molete", "Oke Ado", "Ring Road", "Oke Bola", "Oke Apo", "Oke Aremo", "Aremo", "Oke Mapo", "Mapo", "Oja Oba", "Felele"], fee: 1200, eta: "Same day or next business day" },
  { name: "Central Ibadan", states: ["Oyo"], cities: ["Bodija", "Agodi", "Mokola", "Dugbe", "Jericho", "Sabo", "Samonda", "University of Ibadan", "UI", "Ojoo", "Akobo", "Iwo Road", "Gate", "Total Garden", "Orita Merin", "Oke Itunu", "Eleyele", "Apata", "Aleshinloye", "Oluyole", "Odo Ona", "Challenge Extension"], fee: 1800, eta: "1–2 business days" },
  { name: "Outer Ibadan", states: ["Oyo"], cities: ["Moniya", "Akinyele", "Iyana Church", "Iseyin Road", "Akala Express", "New Garage", "Akobo Ojurin", "Bashorun", "Basorun", "Lalupon", "Amuloko", "Ijokodo", "Apete", "Akufo", "Omi Adio", "Egbeda", "Odo Ona Kekere", "Iyana Bodija", "Alakia", "Aerodrome", "Felele Extension", "Ologuneru", "Mokola Hill"], fee: 2500, eta: "1–3 business days" },
  { name: "Oyo State beyond Ibadan", states: ["Oyo"], cities: cityList(["Oyo Town", "Ogbomoso", "Iseyin", "Saki", "Igboho", "Eruwa", "Lanlate", "Ibadan North", "Ibadan North East", "Ibadan North West", "Ibadan South East", "Ibadan South West", "Ibarapa", "Kisi", "Tede", "Ilero"]), fee: 4000, eta: "2–4 business days" },
  { name: "Lagos", states: ["Lagos"], cities: cityList(["Ikeja", "Yaba", "Surulere", "Lekki", "Victoria Island", "Ikoyi", "Ajah", "Festac", "Amuwo Odofin", "Apapa", "Maryland", "Magodo", "Gbagada", "Ketu", "Agege", "Ogba", "Oshodi", "Mushin", "Iyana Ipaja", "Abule Egba", "Ikorodu", "Epe", "Badagry"]), fee: 5000, eta: "2–4 business days" },
  { name: "Ogun", states: ["Ogun"], cities: cityList(["Abeokuta", "Sango Ota", "Ota", "Ijebu Ode", "Ilaro", "Sagamu", "Ifo", "Mowe", "Ibafo", "Ayetoro", "Ipokia", "Ikenne"]), fee: 4000, eta: "2–4 business days" },
  { name: "Osun", states: ["Osun"], cities: cityList(["Osogbo", "Ile Ife", "Ilesa", "Ede", "Ikirun", "Iwo", "Ila Orangun", "Ipetumodu", "Modakeke"]), fee: 3500, eta: "2–4 business days" },
  { name: "Ondo", states: ["Ondo"], cities: cityList(["Akure", "Ondo Town", "Owo", "Ore", "Ikare", "Okitipupa", "Idanre"]), fee: 4500, eta: "3–5 business days" },
  { name: "Ekiti", states: ["Ekiti"], cities: cityList(["Ado Ekiti", "Ikere Ekiti", "Ikole Ekiti", "Ijero Ekiti", "Ilawe Ekiti", "Oye Ekiti"]), fee: 4500, eta: "3–5 business days" },
  { name: "Kwara", states: ["Kwara"], cities: cityList(["Ilorin", "Offa", "Jebba", "Omu Aran", "Lafiagi", "Share"]), fee: 5000, eta: "3–5 business days" },
  { name: "Kogi", states: ["Kogi"], cities: cityList(["Lokoja", "Okene", "Kabba", "Anyigba", "Idah", "Ajaokuta"]), fee: 5500, eta: "3–5 business days" },
  { name: "Edo", states: ["Edo"], cities: cityList(["Benin City", "Auchi", "Ekpoma", "Uromi", "Irrua", "Oredo"]), fee: 6000, eta: "3–5 business days" },
  { name: "Delta", states: ["Delta"], cities: cityList(["Asaba", "Warri", "Sapele", "Ughelli", "Effurun", "Abraka", "Agbor"]), fee: 6500, eta: "3–5 business days" },
  { name: "Anambra", states: ["Anambra"], cities: cityList(["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ihiala", "Otuocha"]), fee: 6500, eta: "3–5 business days" },
  { name: "Enugu", states: ["Enugu"], cities: cityList(["Enugu", "Nsukka", "Oji River", "Udi", "Agbani"]), fee: 6500, eta: "3–5 business days" },
  { name: "Imo", states: ["Imo"], cities: cityList(["Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta"]), fee: 6500, eta: "3–5 business days" },
  { name: "Abia", states: ["Abia"], cities: cityList(["Umuahia", "Aba", "Ohafia", "Arochukwu"]), fee: 6500, eta: "3–5 business days" },
  { name: "Ebonyi", states: ["Ebonyi"], cities: cityList(["Abakaliki", "Afikpo", "Onueke"]), fee: 7000, eta: "3–5 business days" },
  { name: "Rivers", states: ["Rivers"], cities: cityList(["Port Harcourt", "Obio Akpor", "Bonny", "Eleme", "Bori"]), fee: 7000, eta: "3–5 business days" },
  { name: "Bayelsa", states: ["Bayelsa"], cities: cityList(["Yenagoa", "Brass", "Ogbia", "Sagbama"]), fee: 7500, eta: "4–6 business days" },
  { name: "Akwa Ibom", states: ["Akwa Ibom"], cities: cityList(["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak"]), fee: 7500, eta: "4–6 business days" },
  { name: "Cross River", states: ["Cross River"], cities: cityList(["Calabar", "Ikom", "Ogoja", "Obudu", "Ugep"]), fee: 7500, eta: "4–6 business days" },
  { name: "FCT Abuja", states: ["FCT"], cities: cityList(["Abuja", "Gwarinpa", "Wuse", "Maitama", "Asokoro", "Jabi", "Kubwa", "Lugbe", "Nyanya", "Garki", "Karu"]), fee: 6500, eta: "3–5 business days" },
  { name: "Niger", states: ["Niger"], cities: cityList(["Minna", "Suleja", "Bida", "Kontagora", "New Bussa"]), fee: 7000, eta: "4–6 business days" },
  { name: "Nasarawa", states: ["Nasarawa"], cities: cityList(["Lafia", "Keffi", "Karu", "Akwanga", "Nassarawa"]), fee: 7000, eta: "4–6 business days" },
  { name: "Plateau", states: ["Plateau"], cities: cityList(["Jos", "Bukuru", "Pankshin", "Shendam", "Langtang"]), fee: 7500, eta: "4–6 business days" },
  { name: "Benue", states: ["Benue"], cities: cityList(["Makurdi", "Gboko", "Otukpo", "Katsina Ala"]), fee: 7500, eta: "4–6 business days" },
  { name: "Taraba", states: ["Taraba"], cities: cityList(["Jalingo", "Wukari", "Bali", "Takum"]), fee: 8000, eta: "4–6 business days" },
  { name: "Adamawa", states: ["Adamawa"], cities: cityList(["Yola", "Mubi", "Jimeta", "Numan"]), fee: 8500, eta: "4–6 business days" },
  { name: "Bauchi", states: ["Bauchi"], cities: cityList(["Bauchi", "Azare", "Misau", "Jamaare"]), fee: 8500, eta: "4–6 business days" },
  { name: "Gombe", states: ["Gombe"], cities: cityList(["Gombe", "Kaltungo", "Billiri", "Dukku"]), fee: 8500, eta: "4–6 business days" },
  { name: "Kaduna", states: ["Kaduna"], cities: cityList(["Kaduna", "Zaria", "Kafanchan", "Kagoro", "Soba"]), fee: 8000, eta: "4–6 business days" },
  { name: "Kano", states: ["Kano"], cities: cityList(["Kano", "Wudil", "Rano", "Bichi", "Gwarzo"]), fee: 9000, eta: "4–6 business days" },
  { name: "Katsina", states: ["Katsina"], cities: cityList(["Katsina", "Daura", "Funtua", "Malumfashi"]), fee: 9000, eta: "4–6 business days" },
  { name: "Jigawa", states: ["Jigawa"], cities: cityList(["Dutse", "Hadejia", "Gumel", "Birnin Kudu"]), fee: 9000, eta: "4–6 business days" },
  { name: "Zamfara", states: ["Zamfara"], cities: cityList(["Gusau", "Kaura Namoda", "Talata Mafara", "Anka"]), fee: 9500, eta: "5–7 business days" },
  { name: "Sokoto", states: ["Sokoto"], cities: cityList(["Sokoto", "Tambuwal", "Wamakko", "Goronyo"]), fee: 9500, eta: "5–7 business days" },
  { name: "Kebbi", states: ["Kebbi"], cities: cityList(["Birnin Kebbi", "Argungu", "Yauri", "Zuru"]), fee: 9500, eta: "5–7 business days" },
  { name: "Borno", states: ["Borno"], cities: cityList(["Maiduguri", "Biu", "Bama", "Monguno"]), fee: 10500, eta: "5–7 business days" },
  { name: "Yobe", states: ["Yobe"], cities: cityList(["Damaturu", "Potiskum", "Gashua", "Nguru"]), fee: 10000, eta: "5–7 business days" },
];

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const collection = mongoose.connection.db.collection("deliveryzones");
const doorDeliveryZones = new Set(["Challenge & Ring Road, Ibadan", "Central Ibadan", "Outer Ibadan"]);
for (const zone of zones) {
  await collection.updateOne({ name: zone.name }, { $set: { ...zone, fulfillmentMethod: doorDeliveryZones.has(zone.name) ? "door_delivery" : "park_pickup", active: true, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
}
console.log(`Seeded ${zones.length} delivery zones.`);
await mongoose.disconnect();
