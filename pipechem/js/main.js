/* ============================================================
   PIPE CHEM — Main JavaScript
   Handles: SPA routing, nav, product detail, forms, localStorage
   ============================================================ */

// ── State ──
let currentSection = 'home';
let navOpen = false;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHamburger();
  initInquiryForm();
  updateCartBadges();

  // Handle URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash && ['about','products','experiences','facilities','inquiry','contact'].includes(hash)) {
    showSection(hash);
  }
});

// ── Header scroll effect ──
function initHeader() {
  window.addEventListener('scroll', () => {
    const h = document.getElementById('site-header');
    if (window.scrollY > 30) h.classList.add('scrolled');
    else h.classList.remove('scrolled');
  }, { passive: true });
}

// ── Hamburger / Nav Overlay ──
function initHamburger() {
  const btn = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('nav-overlay');

  btn.addEventListener('click', toggleNav);

  // Close on overlay background click (not on nav items)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeNav();
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOpen) closeNav();
  });
}

function toggleNav() {
  navOpen ? closeNav() : openNav();
}
function openNav() {
  navOpen = true;
  const btn = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('nav-overlay');
  btn.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  navOpen = false;
  const btn = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('nav-overlay');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  // close products dropdown too
  const prodsItem = document.getElementById('nav-products-item');
  if (prodsItem) prodsItem.classList.remove('open');
}

// Navigate from overlay
function navGo(section) {
  closeNav();
  setTimeout(() => showSection(section), 200);
}

// Products dropdown toggle in overlay
function toggleProductsDropdown(e) {
  e.stopPropagation();
  const item = document.getElementById('nav-products-item');
  item.classList.toggle('open');
}

// ── Section Routing ──
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  // Show target
  const target = document.getElementById('section-' + sectionId);
  if (target) {
    target.classList.add('active');
    currentSection = sectionId;
    window.location.hash = sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If products section, show overview
    if (sectionId === 'products') {
      showProductsOverview();
    }
  }

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
}

// ── Product System ──
function showProduct(productId) {
  closeNav();
  showSection('products');
  setTimeout(() => {
    document.getElementById('products-overview').style.display = 'none';
    const detailView = document.getElementById('product-detail-view');
    detailView.classList.add('active');
    const content = document.getElementById('product-detail-content');
    content.innerHTML = generateProductHTML(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
}

function showProductsOverview() {
  document.getElementById('products-overview').style.display = 'block';
  const detailView = document.getElementById('product-detail-view');
  detailView.classList.remove('active');
}

function backToProducts() {
  showProductsOverview();
}

// ── Product Data & HTML Generator ──
const PRODUCTS = {

  hcl: {
    icon: '⚗️',
    name: 'Hydrochloric Acid (HCl) 30% – 32%',
    un: 'UN 1789',
    hazClass: 'Class 8 Corrosive',
    grade: 'Industrial / Technical Grade',
    cas: 'CAS 7647-01-0',
    description: 'Hydrochloric Acid 30–32% is an industrial-grade aqueous solution of hydrogen chloride gas in water. Formulated for high reactivity and consistency, it serves as a core mineral acid across chemical manufacturing, water treatment, metal processing, and heavy industrial applications.',
    specs: [
      ['Chemical Formula', 'HCl'],
      ['CAS Number', '7647-01-0'],
      ['Concentration', '30.0% – 32.0% w/w'],
      ['Appearance', 'Clear, colorless to pale yellow liquid'],
      ['Odor', 'Strong, pungent, suffocating'],
      ['Density / Sp. Gravity', '~1.150 – 1.160 g/cm³ at 20°C'],
      ['pH', '< 1 (strongly acidic)'],
      ['Boiling Point', '~108°C'],
      ['Freezing Point', 'Below -30°C'],
      ['Grade', 'Commercial / Industrial / Technical Grade'],
    ],
    applications: [
      ['Steel Pickling & Surface Treatment', 'Eliminates surface rust, mill scale, and iron oxide from steel coils, pipes, and fabricated parts prior to galvanizing, electroplating, or coating.'],
      ['Water Treatment & pH Adjustment', 'Used for neutralizing alkaline effluents, standardizing wastewater streams, and regenerating ion-exchange resin beds in water treatment plants.'],
      ['Chemical Synthesis', 'Functions as a raw material for producing inorganic chlorides (ferric chloride, polyaluminium chloride, calcium chloride) and organic intermediates.'],
      ['Oil & Gas Field Services', 'Utilized in acidizing operations to dissolve carbonate formations and stimulate well bore productivity.'],
      ['Textiles & Dyes', 'Applied during scouring, dye neutralization, and intermediate manufacturing.'],
      ['Industrial & Heavy Cleaning', 'Removes mortar, efflorescence, scale, and mineral deposits from concrete, masonry, and plant equipment.'],
    ],
    packaging: ['35 kg / 50 kg HDPE carboys', '220 kg / 250 kg HDPE barrels', '1,000 L / 1.15 MT IBC totes', 'Road tankers (rubber-lined / FRP) for bulk supply'],
    safety: 'Highly corrosive to skin, eyes, and mucous membranes. Vapors are respiratory irritants. Wear acid-resistant gloves, face shield, splash goggles, and apron. Work only in well-ventilated areas or under fume extraction hoods.',
    storage: 'Store tightly closed in dedicated, corrosion-resistant containment areas away from alkalis, strong oxidizers, cyanides, and reactive metals. Maintain in cool, shaded spaces.',
  },

  h2so4: {
    icon: '🧪',
    name: 'Dilute Sulphuric Acid (H₂SO₄)',
    un: 'UN 2796',
    hazClass: 'Class 8 Corrosive',
    grade: 'Industrial / Battery / Technical Grade',
    cas: 'CAS 7664-93-9',
    description: 'Dilute Sulphuric Acid is an aqueous solution of sulphuric acid, formulated to specific industrial concentrations (commonly ranging from 70% to 74%, or custom battery/commercial grades like 33%–38%). It provides a stable, highly reactive source of sulfate ions and strong acidity without the aggressive exotherm or extreme fuming risks associated with concentrated (98%) acid.',
    specs: [
      ['Chemical Formula', 'H₂SO₄'],
      ['CAS Number', '7664-93-9'],
      ['Concentrations', '70% – 74% w/w (Battery Grade ~33%–38% available)'],
      ['Appearance', 'Clear, colorless, odorless liquid'],
      ['Odor', 'Odorless to faint acidic smell'],
      ['Density / Sp. Gravity', '1.07 – 1.42 g/cm³ at 20°C (concentration-dependent)'],
      ['pH', '< 1 (strongly acidic)'],
      ['Boiling Point', '> 100°C (varies by concentration)'],
      ['Grade', 'Industrial Grade, Battery Grade / Electrolyte Grade, Technical Grade'],
    ],
    applications: [
      ['Lead-Acid Battery Electrolyte', 'High-purity dilute acid (~33%–38%) serves as the primary electrolyte in automotive, tubular, and solar inverter batteries.'],
      ['Effluent Treatment & Neutralization', 'Balances alkaline industrial wastewater, neutralizes process discharge, and manages pH in municipal and commercial ETP/STP units.'],
      ['Metal Cleaning & Pickling', 'Removes oxidation layers, mill scale, and inorganic residues from copper, brass, and steel components prior to plating or finishing.'],
      ['Chemical Synthesis & Fertilizer', 'Source of sulfate groups for intermediate production, aluminum sulfate processing, and chemical reagents.'],
      ['Textile & Dye Processing', 'Used for fiber treatment, dyeing baths, pH adjustment, and washing stages.'],
      ['Demineralization', 'Regenerates cation exchange resin beds in industrial DM water systems.'],
    ],
    packaging: ['35 kg / 50 kg HM-HDPE carboys', '200 kg / 250 kg HDPE drums', '1,000 L / 1.2 MT IBC Totes', 'Rubber-lined, lead-lined, or FRP road tankers for bulk delivery'],
    safety: 'Highly corrosive to skin, eyes, and clothing. Always use chemical-resistant safety goggles, face shields, PVC/nitrile gloves, and acid-proof aprons during transfer.',
    storage: 'Keep containers tightly capped in a cool, well-ventilated, bunded area away from direct heat, alkaline compounds, and organic materials. Never add water directly to hot or concentrated residues; always maintain proper dilution protocols.',
  },

  hno3: {
    icon: '🔬',
    name: 'Dilute Nitric Acid (HNO₃) – 24%',
    un: 'UN 2031',
    hazClass: 'Class 8 Corrosive | Sub-risk: Oxidizer',
    grade: 'Industrial / Technical Grade',
    cas: 'CAS 7697-37-2',
    description: 'Dilute Nitric Acid 24% is an aqueous, precision-diluted mineral acid solution with strong oxidizing and acidic properties. Prepared under controlled dilution to eliminate handling hazards associated with concentrated (68%) acid, it is widely utilized for metal pickling, passivating stainless steel, chemical synthesis, and industrial CIP operations.',
    specs: [
      ['Chemical Formula', 'HNO₃'],
      ['CAS Number', '7697-37-2'],
      ['Assay / Concentration', '24.0% (±1.0%) w/w'],
      ['Appearance', 'Clear, colorless to faintly yellowish liquid'],
      ['Odor', 'Mildly pungent, characteristic acidic odor'],
      ['Specific Gravity', '~1.140 – 1.150 g/cm³ at 20°C'],
      ['pH', '< 1 (strongly acidic)'],
      ['Boiling Point', '~104°C – 106°C'],
      ['Grade', 'Industrial / Technical Grade'],
    ],
    applications: [
      ['Stainless Steel Passivation & Pickling', 'Dissolves free iron surface contaminants and accelerates formation of a protective chromium oxide layer on stainless steel fabrications.'],
      ['Metal Finishing & Etching', 'Used in aluminum deoxidizing, copper/brass bright dipping, and PCB chemical surface preparation.'],
      ['Dairy & Food Processing CIP', 'Effectively dissolves scale, milkstone, and calcium phosphate deposits in automated pipework and pasteurizers.'],
      ['Fertilizer & Nitrate Manufacturing', 'Used as a raw material for formulating specialty liquid fertilizers and secondary nitrate salts.'],
      ['Chemical Synthesis & Laboratory', 'Reagent for oxidation reactions, pH regulation, and intermediate manufacturing.'],
    ],
    packaging: ['35 kg / 50 kg UV-stabilized HDPE carboys', '200 kg / 250 kg HDPE barrels', '1,000 L IBC Totes', 'Dedicated 316L SS or approved lined road tankers for bulk supply'],
    safety: 'Corrosive to skin, eyes, and mucous membranes. Vapors can cause respiratory irritation. Handle using acid-resistant nitrile/PVC gloves, face shield, splash apron, and safety goggles.',
    storage: 'Store in a cool, well-ventilated, bunded area away from direct sunlight, combustible substances, reducing agents, alkalis, and organic materials. Keep containers securely closed with vented caps.',
  },

  na2so4: {
    icon: '🧂',
    name: 'Sodium Sulphate (Na₂SO₄) – 93%–99%',
    un: 'Non-Hazardous',
    hazClass: 'Non-Dangerous Goods',
    grade: 'Industrial / Detergent / Glass Grade',
    cas: 'CAS 7757-82-6',
    description: 'Sodium Sulphate (Anhydrous) is a high-purity, white crystalline inorganic salt. Chemically inert, highly soluble in water, and thermally stable, it serves as a critical raw material and processing aid across detergent powder manufacturing, glass production, textile dyeing, and pulp and paper processing.',
    specs: [
      ['Chemical Name', 'Anhydrous Sodium Sulphate'],
      ['Chemical Formula', 'Na₂SO₄'],
      ['CAS Number', '7757-82-6'],
      ['Purity / Assay', '93.0% – 99.0% min'],
      ['Appearance', 'White crystalline powder / fine granules'],
      ['Odor', 'Odorless'],
      ['Moisture Content', '≤ 0.5% – 1.0%'],
      ['pH (5% Solution)', '6.0 – 8.5 (neutral)'],
      ['Bulk Density', '~1.30 – 1.60 g/cm³'],
      ['Melting Point', '884°C'],
      ['Water Solubility', '~28 g/100 mL at 25°C'],
    ],
    applications: [
      ['Powder Detergents & Cleaning', 'Widely used as an inert filler and bulking agent in washing powders to maintain free-flowing properties and regulate product density.'],
      ['Textile & Dyeing Industry', 'Acts as a leveling and exhausting agent in reactive and direct dyeing baths, promoting uniform dye penetration on cotton fibers.'],
      ['Glass Manufacturing', 'Functions as a fining agent in container and flat glass furnaces, assisting in removal of air bubbles from molten glass.'],
      ['Pulp & Paper Processing', 'Utilized in the Kraft pulping process for cooking liquor recovery and sulfate replenishment.'],
      ['Chemical Synthesis', 'Precursor and raw material for producing sodium sulfide, sodium silicate, and other inorganic sulfate salts.'],
      ['Leather & Tanning', 'Applied in pickling and beamhouse operations to prevent fiber swelling during hides processing.'],
    ],
    packaging: ['25 kg / 50 kg PP/HDPE woven bags with inner LDPE liner', '1,000 kg / 1,200 kg FIBC bulk bags', 'Containerized pallets or loose bulk truckloads'],
    safety: 'Non-toxic and non-flammable. Wear standard dust masks, safety glasses, and general industrial protective gloves to prevent mechanical eye or respiratory irritation from airborne dust.',
    storage: 'Highly hygroscopic in humid conditions; store in a cool, dry, and well-ventilated warehouse on pallets. Keep bags tightly sealed to avoid caking and moisture absorption.',
  },

  h3po4: {
    icon: '🌿',
    name: 'Phosphoric Acid (H₃PO₄) – 78% (P₂O₅: 57.1%)',
    un: 'UN 1805',
    hazClass: 'Class 8 Corrosive, PG III',
    grade: 'Technical / Fertilizer / Industrial Grade',
    cas: 'CAS 7664-38-2',
    description: 'We supply high-purity industrial and technical-grade Phosphoric Acid (Orthophosphoric Acid) formulated to a consistent 78.3% assay with an active Phosphorus Pentoxide (P₂O₅) concentration of 57.1%. Sourced and delivered under strict quality standards, it serves as a high-efficiency phosphorus source for agrochemicals, metal surface pre-treatment, water conditioning, and chemical intermediate manufacturing.',
    specs: [
      ['Chemical Formula', 'H₃PO₄'],
      ['CAS Number', '7664-38-2'],
      ['Assay (as H₃PO₄)', '78.3% (by Titration Method)'],
      ['P₂O₅ Content', '57.1%'],
      ['Sulphate (SO₄) Content', '7.30%'],
      ['Appearance', 'Clear, non-turbid liquid solution'],
      ['Specific Gravity', '~1.708 (at 20°C)'],
      ['pH', '< 1 (strongly acidic)'],
      ['Grade', 'Technical / Fertilizer / Industrial Grade'],
    ],
    applications: [
      ['Agriculture & Fertilizer', 'High P₂O₅ content makes it an ideal raw material for liquid NPK formulations, fertigation, foliar sprays, and phosphate salt synthesis (MAP/DAP).'],
      ['Metal Treatment & Rust Passivation', 'Utilized in phosphate conversion coatings and pickling baths to convert iron oxides into protective iron phosphate.'],
      ['Industrial Water & Effluent Treatment', 'Controls mineral scale deposition, sequesters hard metal ions, and aids in pH adjustment for industrial wastewater streams.'],
      ['Chemical Synthesis', 'Essential building block for manufacturing industrial phosphate salts, specialty flame retardants, and chemical process catalysts.'],
      ['Descaling & Plant Maintenance', 'Formulated into specialized heavy-duty acid cleaners to dissolve hard water scale, rust, and calcium build-up.'],
    ],
    packaging: ['35 kg / 50 kg heavy-duty HDPE carboys', '280 kg / 300 kg HM-HDPE barrels', '1,000 L / 1.6 MT composite IBC totes', 'Rubber-lined and 316L SS road tankers for high-volume delivery'],
    safety: 'Corrosive to skin, eyes, and respiratory passages. Handle with acid-resistant gloves, protective safety goggles, full face shields, and chemical aprons.',
    storage: 'Store in original, tightly sealed containers within a cool, dry, well-ventilated, and bunded area away from direct sunlight, reactive metals, and strong alkaline substances.',
  },

  naocl: {
    icon: '💧',
    name: 'Sodium Hypochlorite (NaOCl) – 10%–12%',
    un: 'UN 1791',
    hazClass: 'Class 8 Corrosive, PG III',
    grade: 'Industrial / Water Treatment Grade',
    cas: 'CAS 7681-52-9',
    description: 'We supply industrial-grade Sodium Hypochlorite solution formulated to deliver consistent, active available chlorine (typically 10%–12% w/v). Recognized for its rapid biocidal and strong oxidative properties, it is an essential chemical agent for large-scale water disinfection, municipal effluent treatment, industrial bleaching, and institutional sanitation.',
    specs: [
      ['Chemical Formula', 'NaOCl'],
      ['CAS Number', '7681-52-9'],
      ['Available Chlorine', '10.0% – 12.0% w/v (custom strength available)'],
      ['Appearance', 'Clear, pale yellow-greenish liquid'],
      ['Odor', 'Characteristic sharp chlorine odor'],
      ['Specific Gravity', '~1.16 – 1.22 g/cm³ at 20°C'],
      ['pH', '11.5 – 13.0 (strongly alkaline)'],
      ['Free Alkali (as NaOH)', '0.5% – 1.5% max'],
      ['Grade', 'Industrial Grade / Water Treatment Grade'],
    ],
    applications: [
      ['Water Disinfection & Purification', 'Widely used as a primary disinfectant in municipal drinking water networks, cooling towers, and commercial swimming pools.'],
      ['Wastewater & Effluent Treatment', 'Oxidizes organic contaminants, cyanide compounds, and sulfides; neutralizes offensive industrial odors in ETP/STP facilities.'],
      ['Textile & Paper Bleaching', 'Serves as an effective bleaching agent for raw cotton fibers, cellulosic textiles, and recycled paper pulp.'],
      ['Industrial CIP & Surface Sanitation', 'Used across dairy plants, food and beverage processing facilities, and healthcare institutions for CIP and microbial sanitization.'],
      ['Chemical Synthesis', 'Functions as an oxidizing agent in organic intermediate reactions, chlorination processes, and hydrazine manufacture.'],
    ],
    packaging: ['35 kg / 50 kg UV-resistant HM-HDPE carboys', '200 kg / 250 kg HDPE barrels', '1,000 L / 1.2 MT IBC totes with vented caps', 'FRP or rubber-lined road tankers for direct site offloading'],
    safety: 'Causes severe chemical burns to skin and irreversible eye injury. Always use chemical splash goggles, full face shields, heavy-duty PVC/nitrile gloves, and rubber aprons. NEVER mix with acids — toxic chlorine gas will be released immediately.',
    storage: 'Sodium Hypochlorite naturally degrades over time due to heat, UV exposure, and transition metals. Store tightly capped in cool, dark, well-ventilated areas away from direct sunlight, organic materials, and acidic chemicals. Containers must feature pressure-relief vented caps.',
  },

  ferric: {
    icon: '🏭',
    name: 'Ferric Alum (Alumino-Ferric / Industrial Aluminium Sulphate)',
    un: 'Non-Hazardous',
    hazClass: 'Non-Dangerous Goods',
    grade: 'Grade 4 as per IS:299:2012',
    cas: 'CAS 10043-01-3 (Aluminium Sulphate base)',
    description: 'We supply premium-grade Ferric Alum (Alumino-Ferric), an economical and highly effective primary coagulant conforming to IS:299 standards. Formulated through the controlled digestion of high-grade bauxite with sulphuric acid, it features balanced water-soluble aluminium and iron salts that accelerate floc formation and create heavier, fast-settling flocs.',
    specs: [
      ['Chemical Formula', 'Al₂(SO₄)₃ · xH₂O with Fe salts'],
      ['CAS Number', '10043-01-3 (Al Sulphate base)'],
      ['Water-Soluble Alumina (Al₂O₃)', '15.0% – 16.0% min (Grade 4)'],
      ['Iron Content (as Fe₂O₃)', '0.3% – 0.8% max'],
      ['Insoluble Matter', '≤ 0.5% max'],
      ['pH (5% Solution)', '2.7 – 3.5'],
      ['Appearance', 'Light grey to yellowish-brown solid slabs/lumps/powder'],
      ['Standard Grade', 'Grade 4 as per IS:299:2012'],
    ],
    applications: [
      ['Effluent & Industrial Wastewater Treatment (ETP/STP)', 'Destabilizes colloidal suspensions and precipitates suspended solids, significantly cutting BOD, COD, and turbidity in industrial discharge.'],
      ['Raw & Municipal Water Clarification', 'Cost-effective bulk coagulant in water intake plants to clear silt, algae, and suspended organic matter.'],
      ['Kraft & Duplex Paper Manufacturing', 'Widely used as an internal rosin sizing agent for non-white paper, duplex board, and corrugated packaging.'],
      ['Textile & Dyeing Wash-Water Treatment', 'Binds and precipitates suspended dye molecules and heavy metal traces from process wash streams.'],
      ['Sludge Dewatering & Conditioning', 'Improves solid-liquid separation and enhances filter-cake release in centrifuges and filter presses.'],
    ],
    packaging: ['18 kg – 20 kg cast solid slabs', '50 kg heavy-duty HDPE woven bags (lumps/kibbled)', '25 kg / 50 kg PP laminated bags (powder)', 'Full-truckload (FTL) bulk shipments'],
    safety: 'Solid alum is stable, but dissolved solutions are moderately acidic. Use acid-proof tanks and dosing gear (PP, HDPE, FRP, or rubber-lined steel). Wear industrial dust masks, rubber gloves, and protective goggles when preparing stock solutions.',
    storage: 'Store on wooden pallets in a cool, covered, dry warehouse away from moisture and direct rainwater exposure to prevent softening and caking.',
  },

  speciality: {
    icon: '✨',
    name: 'Speciality Chemicals & Performance Formulations',
    un: 'Varies by Product',
    hazClass: 'Refer Individual MSDS',
    grade: 'Custom / Application Grade',
    cas: 'Varies by Product',
    description: 'We supply high-performance speciality chemicals engineered to solve complex operational challenges across diverse processing industries. Unlike commodity bulk chemicals, our speciality formulations are application-driven solutions designed to enhance process efficiency, improve end-product quality, protect industrial assets from degradation, and optimize chemical consumption.',
    specs: [
      ['Product Type', 'Application-specific specialty formulations'],
      ['Packaging', 'Custom per product requirement'],
      ['Active Content', 'Varies by formulation and application'],
      ['Regulatory', 'Manufactured to industry safety & environmental standards'],
      ['Technical Support', 'Full support, jar testing, and site-dosage optimization available'],
    ],
    applications: [
      ['Industrial Water Treatment Chemicals', 'Antiscalants, corrosion inhibitors, biocides, oxygen scavengers, and defoamers for boiler feed, cooling towers, and RO plants.'],
      ['Effluent Treatment & Coagulation Aids', 'Polyacrylamides (cationic/anionic/non-ionic), de-colorizing agents, heavy metal precipitants, and sludge dewatering aids for ETP/STP.'],
      ['Textile & Auxiliary Chemicals', 'Pre-treatment wetting agents, sequestering agents, leveling aids, dye-fixing polymers, enzyme concentrates, and specialty finishing silicones.'],
      ['Surface Treatment & Metal Pre-treatment', 'Heavy-duty degreasers, phosphating concentrates, passivation aids, and pickling inhibitors.'],
      ['Pulp & Paper Process Chemicals', 'Wet-strength resins, retention aids, defoamers, sizing promoters, and de-inking formulations.'],
      ['Disinfectants & Industrial Cleaners', 'Food-grade sanitizers, CIP descalers, membrane cleaners, biocide formulations, and heavy-duty degreasing compounds.'],
    ],
    packaging: ['25 kg / 35 kg / 50 kg HM-HDPE carboys', '200 kg / 250 kg HDPE drums', '1,000 L / 1 MT composite IBC totes', 'Private-label packing and concentration adjustments available on request'],
    safety: 'Review individual Material Safety Data Sheets (MSDS) for specific protective equipment guidelines and handling requirements per formulation.',
    storage: 'Store in original, securely sealed containers in a cool, dry, well-ventilated, and covered storage bay away from extreme temperatures and direct sunlight.',
  },

  solvents: {
    icon: '♻️',
    name: 'Spent Solvents / Solvent Recovery Services',
    un: 'Class 3 (Flammable Liquids)',
    hazClass: 'Hazardous — Class 3 Flammable',
    grade: 'Recovery / Secondary Grade',
    cas: 'Varies by Solvent Stream',
    description: 'We provide compliant handling, sourcing, and recovery solutions for spent and secondary industrial solvents generated during chemical synthesis, pharmaceutical manufacturing, paint formulations, and industrial washing operations. By integrating recovery and recycling processes, we help manufacturing units reclaim value, reduce waste generation, and meet environmental compliance standards.',
    specs: [
      ['Service Type', 'Solvent Recovery, Buyback & Toll Distillation'],
      ['Hazard Class', 'Class 3 (Flammable Liquids)'],
      ['Streams Handled', 'Alcohols, Ketones, Aromatics, Esters, Chlorinated, Specialty Solvents'],
      ['Compliance', 'Hazardous & Other Wastes Rules, CPCB/SPCB norms'],
      ['Documentation', 'COA, TREM Cards, Hazardous Waste Consignment Manifests'],
      ['Transport', 'GPS-tracked, spark-arrested, explosion-proof road tankers'],
    ],
    applications: [
      ['Common Spent Solvents — Alcohols', 'Spent Methanol, Isopropanol (IPA), Ethanol, Butanol'],
      ['Common Spent Solvents — Ketones', 'Spent Acetone, MEK (Methyl Ethyl Ketone), MIBK (Methyl Isobutyl Ketone)'],
      ['Common Spent Solvents — Aromatics', 'Spent Toluene, Mixed Xylenes, Hexane, Cyclohexane'],
      ['Common Spent Solvents — Esters', 'Spent Ethyl Acetate, Butyl Acetate'],
      ['Chlorinated Solvents', 'Spent Dichloromethane (MDC / Methylene Chloride)'],
      ['Specialty Solvents', 'Spent THF (Tetrahydrofuran), DMF (Dimethylformamide), Acetonitrile'],
    ],
    packaging: ['MS & HDPE Barrels: 200–220 L drums on palletized shipments', '1,000 L UN-approved composite IBC totes', '10 MT to 30 MT SS304/SS316 and mild steel road tankers', 'Closed-loop drum arrangements for hazardous streams'],
    safety: 'Store strictly in cool, explosion-proof, covered hazardous storage sheds equipped with flame-proof lighting, earthing/bonding mechanisms, and secondary spillage containment bunds. Ground and bond all transfer lines to eliminate static discharge. Operators must use anti-static footwear, spark-proof tools, organic vapor respirators, and chemical-resistant nitrile gloves.',
    storage: 'Keep Class B / dry chemical powder fire extinguishers accessible at all times. Storage must comply with Hazardous and Other Wastes (Management and Transboundary Movement) Rules.',
  },

};

function generateProductHTML(id) {
  const p = PRODUCTS[id];
  if (!p) return '<p>Product not found.</p>';

  const specsRows = p.specs.map(([k, v]) =>
    `<tr><td>${k}</td><td>${v}</td></tr>`
  ).join('');

  const appItems = p.applications.map(([title, desc]) =>
    `<div class="app-item"><div class="app-item-dot"></div><div class="app-item-text"><strong>${title}:</strong> ${desc}</div></div>`
  ).join('');

  const pkgTags = p.packaging.map(pkg =>
    `<span class="pkg-tag">${pkg}</span>`
  ).join('');

  return `
    <div class="product-detail-header">
      <div class="product-detail-icon-big">${p.icon}</div>
      <div class="product-detail-title-block">
        <h1>${p.name}</h1>
        <div class="product-detail-badges">
          <span class="detail-badge cas">${p.cas}</span>
          <span class="detail-badge un">${p.un}</span>
          <span class="detail-badge class">${p.hazClass}</span>
          <span class="detail-badge grade">${p.grade}</span>
        </div>
      </div>
    </div>

    <div class="detail-card full" style="margin-bottom:1.5rem;">
      <h3><span class="card-icon">📋</span> Product Description</h3>
      <p style="color:var(--text-muted);line-height:1.8;font-size:.92rem;">${p.description}</p>
    </div>

    <div class="detail-grid">
      <div class="detail-card">
        <h3><span class="card-icon">🔬</span> Technical Specifications</h3>
        <table class="spec-table"><tbody>${specsRows}</tbody></table>
      </div>
      <div class="detail-card">
        <h3><span class="card-icon">🏭</span> Key Applications</h3>
        <div class="app-list">${appItems}</div>
      </div>
    </div>

    <div class="detail-card full" style="margin-bottom:1.5rem;">
      <h3><span class="card-icon">📦</span> Packaging & Supply</h3>
      <div class="pkg-items">${pkgTags}</div>
    </div>

    <div class="detail-card full">
      <h3><span class="card-icon">⚠️</span> Handling, Safety & Storage</h3>
      <div class="safety-box">
        <p><strong>Safety / Handling:</strong> ${p.safety}</p>
        <p><strong>Storage:</strong> ${p.storage}</p>
      </div>
    </div>

    <div style="margin-top:2rem;text-align:center;padding:2rem;background:var(--off-white);border-radius:var(--radius-lg);border:1px solid var(--gray-200);">
      <h3 style="color:var(--navy);margin-bottom:.5rem;">Need This Chemical?</h3>
      <p style="color:var(--text-muted);margin-bottom:1.2rem;font-size:.9rem;">Submit an inquiry with your quantity and price expectations — our team will respond promptly.</p>
      <button class="btn-primary" onclick="navGo('inquiry')" style="margin-right:.8rem;">📋 Submit Inquiry</button>
      <a href="tel:+919558821244" class="btn-outline" style="display:inline-flex;align-items:center;gap:.4rem;padding:.75rem 1.5rem;border-radius:99px;border:1.5px solid var(--navy);color:var(--navy);font-weight:600;">📞 Call Us</a>
    </div>
  `;
}

// ── Inquiry Form ──
function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  form.addEventListener('submit', handleInquirySubmit);

  // Show/hide Other chemical field
  const chemSelect = document.getElementById('inq-chemical');
  if (chemSelect) {
    chemSelect.addEventListener('change', () => {
      const otherGroup = document.getElementById('inq-other-group');
      if (chemSelect.value === 'Other') {
        otherGroup.style.display = 'block';
      } else {
        otherGroup.style.display = 'none';
      }
    });
  }
}

function handleDeliveryChange() {
  const delivered = document.getElementById('radio-delivered');
  const locationField = document.getElementById('location-field');
  if (delivered && delivered.checked) {
    locationField.classList.add('visible');
  } else {
    locationField.classList.remove('visible');
  }
}

function handleInquirySubmit(e) {
  e.preventDefault();

  // Basic validation
  const chemical = document.getElementById('inq-chemical').value;
  const qty = document.getElementById('inq-qty').value;
  const price = document.getElementById('inq-price').value;
  const name = document.getElementById('inq-name').value.trim();
  const phone = document.getElementById('inq-phone').value.trim();
  const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
  const location = document.getElementById('inq-location').value.trim();

  if (!chemical) { showToast('⚠️ Please select a chemical.'); return; }
  if (!qty || parseFloat(qty) <= 0) { showToast('⚠️ Please enter a valid quantity.'); return; }
  if (!price || parseFloat(price) < 0) { showToast('⚠️ Please enter your expected price.'); return; }
  if (!name) { showToast('⚠️ Please enter your name.'); return; }
  if (!phone) { showToast('⚠️ Please enter your phone number.'); return; }
  if (deliveryType === 'Delivered' && !location) { showToast('⚠️ Please enter the delivery location.'); return; }

  const chemName = chemical === 'Other'
    ? (document.getElementById('inq-other-chem').value.trim() || 'Other')
    : chemical;

  // Build inquiry object
  const inquiry = {
    id: 'INQ-' + Date.now(),
    submittedAt: new Date().toISOString(),
    chemical: chemName,
    quantity: qty + ' MT',
    price: '₹ ' + parseFloat(price).toLocaleString('en-IN') + ' / MT',
    deliveryType: deliveryType,
    location: deliveryType === 'Delivered' ? location : 'Ex-Plant',
    name: name,
    phone: phone,
    email: document.getElementById('inq-email').value.trim() || '—',
    message: document.getElementById('inq-message').value.trim() || '—',
    status: 'Pending',
  };

  // Save to localStorage
  const inquiries = JSON.parse(localStorage.getItem('pipechem_inquiries') || '[]');
  inquiries.unshift(inquiry);
  localStorage.setItem('pipechem_inquiries', JSON.stringify(inquiries));

  // Show success
  document.getElementById('inquiry-form').style.display = 'none';
  document.getElementById('inquiry-success').classList.add('show');
  showToast('✅ Inquiry submitted successfully!');
}

function resetInquiryForm() {
  document.getElementById('inquiry-form').reset();
  document.getElementById('inquiry-form').style.display = 'block';
  document.getElementById('inquiry-success').classList.remove('show');
  document.getElementById('location-field').classList.remove('visible');
  document.getElementById('inq-other-group').style.display = 'none';
}

// ── Contact Form ──
function submitContact() {
  const name = document.getElementById('con-name').value.trim();
  const phone = document.getElementById('con-phone').value.trim();
  const message = document.getElementById('con-message').value.trim();

  if (!name || !message) {
    showToast('⚠️ Please fill in your name and message.');
    return;
  }

  // Save to localStorage (contacts pool)
  const contacts = JSON.parse(localStorage.getItem('pipechem_contacts') || '[]');
  contacts.unshift({
    id: 'CON-' + Date.now(),
    submittedAt: new Date().toISOString(),
    name,
    phone: phone || '—',
    email: document.getElementById('con-email').value.trim() || '—',
    company: document.getElementById('con-company').value.trim() || '—',
    subject: document.getElementById('con-subject').value || '—',
    message,
  });
  localStorage.setItem('pipechem_contacts', JSON.stringify(contacts));

  showToast('✅ Message sent! We\'ll contact you soon.');
  document.getElementById('contact-form').reset();
}

// ── Update badge counts from localStorage ──
function updateCartBadges() {
  // nothing in header — admin panel reads from localStorage
}

// ── Toast ──
function showToast(msg, duration = 3500) {
  const toast = document.getElementById('site-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
