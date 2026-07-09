type DownloadableCatalog = {
  brand: string;
  title: string;
  description?: string;
  image: string;
  imageAlt: string;
  href: string;
  imageMode?: "cover" | "contain";
};

type DownloadableCatalogSection = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  paragraphs: string[];
  catalogs: DownloadableCatalog[];
};

export const downloadableCatalogSections: DownloadableCatalogSection[] = [
  {
    slug: "catalogos-generales",
    title: "Catálogos generales",
    eyebrow: "Catálogos PDF",
    description:
      "Selección de marcas profesionales para vestuario laboral, imagen corporativa, promoción, calzado y prendas técnicas. Una base completa para encontrar soluciones adaptadas a distintos sectores, niveles de uso y necesidades de personalización.",
    paragraphs: [
      "Estos catálogos reúnen marcas de referencia con enfoques complementarios: prendas promocionales, ropa corporativa, vestuario técnico, soluciones para exterior, calzado profesional y colecciones pensadas para personalización.",
      "El objetivo es facilitar una primera selección rápida por marca, estilo y uso, manteniendo una experiencia clara para equipos de compras, responsables de imagen corporativa y empresas que necesitan vestir a sus equipos con coherencia.",
    ],
    catalogs: [
      {
        brand: "Clique",
        title: "Catálogo Clique",
        description:
          "Vestuario laboral cómodo, funcional y fácil de personalizar, con polos, camisetas, chaquetas y sudaderas en una amplia variedad de colores.",
        image: "/images/logos/logo1-1-300x204.jpg",
        imageAlt: "Logo Clique",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1ZSNf1O0n6j3VpLhC5U-uueRYE-hWAHo5",
      },
      {
        brand: "Craft",
        title: "Catálogo Craft",
        description:
          "Ropa técnica de alto rendimiento basada en sistemas de capas y tejidos que gestionan la humedad para mantener el confort.",
        image: "/images/logos/logo2-300x204.jpg",
        imageAlt: "Logo Craft",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1eWQaRKN60oG6ZxzEJaGfdwLJ-avGgELn",
      },
      {
        brand: "Deltaplus",
        title: "Catálogo Deltaplus",
        description:
          "Vestuario y soluciones de protección para entornos exigentes, con prendas resistentes para industria, construcción y trabajos técnicos.",
        image: "/images/logos/logo3-1-300x204.jpg",
        imageAlt: "Logo Deltaplus",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1Yd74FsrCvKt1CkgWyqghqLnxC39cecrn",
      },
      {
        brand: "Gary's",
        title: "Catálogo Gary's",
        description:
          "Vestuario profesional para sanidad, hostelería, estética, limpieza y servicios, con diseño actual y tejidos fáciles de mantener.",
        image: "/images/logos/logo14-300x204.jpg",
        imageAlt: "Logo Gary's",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1OaXv9dkW4Pj5oBzAuGsOW4Y2K6jD_vCu",
      },
      {
        brand: "James Harvest",
        title: "Catálogo James Harvest",
        description:
          "Vestuario corporativo casual inspirado en la estética universitaria americana, con polos, camisas y chaquetas de calidad.",
        image: "/images/logos/logo5-1-300x204.jpg",
        imageAlt: "Logo James Harvest",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1TyRxCKAq2NJwLMo0iQy4iYOlqnZIeEWX",
      },
      {
        brand: "J. Harvest & Frost",
        title: "Catálogo J. Harvest & Frost",
        description:
          "Camisas y prendas corporativas para hombre y mujer, desde básicos duraderos hasta líneas técnicas de fácil cuidado.",
        image: "/images/logos/logo4-1-300x204.jpg",
        imageAlt: "Logo J. Harvest & Frost",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1FHZXHKUgz9YC6B2qblMtkuNS0WXiDls5",
      },
      {
        brand: "Makito",
        title: "Catálogo Makito",
        description:
          "Artículos promocionales y vestuario corporativo enfocado en personalización, campañas publicitarias, eventos e imagen de marca.",
        image: "/images/logos/makito-300x129.jpg",
        imageAlt: "Logo Makito",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1dhqMoxVrPMYppAEI9-4nnNXldlix9ign",
      },
      {
        brand: "Mukua",
        title: "Catálogo Mukua",
        description:
          "Vestuario promocional y laboral con buena relación entre calidad, precio y diseño actual, ideal para personalización.",
        image: "/images/logos/mukua-300x129.jpg",
        imageAlt: "Logo Mukua",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1vpD1fW90XWe-9p62ll5y2JGucpGGx0b5",
      },
      {
        brand: "Printer Prime",
        title: "Catálogo Printer Prime",
        description:
          "Vestuario premium y sostenible con diseño bicolor, mezcla ecológica y soluciones pensadas para uso corporativo diario.",
        image: "/images/logos/logo6-1-300x204.jpg",
        imageAlt: "Logo Printer Prime",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1OXK8ZvjjasTHs5fH2dEhrpTwaXRbseqU",
      },
      {
        brand: "Projob",
        title: "Catálogo Projob",
        description:
          "Vestuario laboral sueco con prendas ergonómicas, resistentes y funcionales para construcción, logística e industria.",
        image: "/images/logos/logo10-1-300x204.jpg",
        imageAlt: "Logo Projob",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1IPrtua_RAXx_UInV4pfH_lxv3X_OoddA",
      },
      {
        brand: "Roly",
        title: "Catálogo Roly",
        description:
          "Vestuario laboral, deportivo y promocional con variedad, comodidad y una excelente relación calidad-precio.",
        image: "/images/logos/logo12-1-300x204.jpg",
        imageAlt: "Logo Roly",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1BHikx2hYsOdWJU_LDWAFhJeagmIKEdoI",
      },
      {
        brand: "Roly WRK",
        title: "Catálogo Roly WRK",
        description:
          "Línea profesional de Roly orientada al vestuario laboral técnico para construcción, industria, alimentación y sanidad.",
        image: "/images/logos/logo11-1-300x204.jpg",
        imageAlt: "Logo Roly WRK",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1BHikx2hYsOdWJU_LDWAFhJeagmIKEdoI",
      },
      {
        brand: "Skechers",
        title: "Catálogo Skechers",
        description:
          "Calzado y ropa con foco en comodidad, ligereza e innovación, con tecnologías pensadas para uso diario y profesional.",
        image: "/images/logos/ske.jpg",
        imageAlt: "Logo Skechers",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1NjRVQEC0SWTrXldNnTiE-mC0VWOdDIIT",
      },
      {
        brand: "Stamina",
        title: "Catálogo Stamina",
        description:
          "Vestuario promocional y artículos publicitarios para reforzar la imagen de marca en campañas, ferias y eventos.",
        image: "/images/logos/sta.jpg",
        imageAlt: "Logo Stamina",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1wDceeGMdRgngYm7U8USWCvd3CKy--KU1",
      },
      {
        brand: "Tenson",
        title: "Catálogo Tenson",
        description:
          "Ropa outdoor y laboral con tecnologías impermeables y transpirables para viento, lluvia, frío y trabajo en exterior.",
        image: "/images/logos/logo8-1-300x204.jpg",
        imageAlt: "Logo Tenson",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=12CKBxBgBE3GrKIgbdWJWEkzeMbJ265Dy",
      },
      {
        brand: "Untagged Movement",
        title: "Catálogo Untagged Movement",
        description:
          "Prendas promocionales y corporativas neutras, sin etiquetas visibles, pensadas para personalización y acabados limpios.",
        image: "/images/logos/unt.jpg",
        imageAlt: "Logo Untagged Movement",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1nHf8YXjUxepm8j3uSyCGjmV872whMk6D",
      },
      {
        brand: "Velilla",
        title: "Catálogo Velilla",
        description:
          "Marca de vestuario laboral con amplia trayectoria, reconocida por calidad, resistencia, funcionalidad y buen equilibrio de precio.",
        image: "/images/logos/vel.jpg",
        imageAlt: "Logo Velilla",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=13d_wEtMBu1E6F4_2p-ktCObhpWw_OCWe",
      },
      {
        brand: "VPRO",
        title: "Catálogo VPRO",
        description:
          "Vestuario laboral funcional y resistente para uso diario en entornos profesionales exigentes y múltiples sectores.",
        image: "/images/logos/vpro.jpg",
        imageAlt: "Logo VPRO",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=12KrqUOztLPECgUcgZH5dtR5vZxvkA2oD",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam",
        description:
          "Vestuario laboral para industria, construcción, hostelería y sanidad, con prendas funcionales, resistentes y adaptables.",
        image: "/images/logos/logo9-300x204.jpg",
        imageAlt: "Logo Workteam",
        imageMode: "contain",
        href: "https://drive.google.com/uc?export=download&id=1qa3zV3veJdseh0kMeuGB0hOnF-xp7onT",
      },
    ],
  },
  {
    slug: "alta-visibilidad",
    title: "Alta visibilidad",
    eyebrow: "Catálogos PDF",
    description:
      "La ropa de alta visibilidad es esencial para proteger a los trabajadores en entornos donde ser visto marca la diferencia. Es una solución imprescindible en sectores como la logística, el transporte, la construcción, la industria, la obra pública, los servicios urbanos o el mantenimiento de carreteras.",
    paragraphs: [
      "En Bogerd Pro ofrecemos vestuario de alta visibilidad diseñado para garantizar seguridad, confort y funcionalidad durante toda la jornada laboral. Disponemos de prendas que combinan tejidos resistentes, diseño ergonómico y elementos reflectantes de alta calidad para mejorar la visibilidad tanto de día como de noche, y en condiciones de baja luminosidad.",
      "Nuestra gama incluye camisetas, polos, chaquetas, pantalones, chalecos, sudaderas y ropa impermeable de alta visibilidad, adaptada a distintos entornos de trabajo y condiciones climáticas. Trabajamos con marcas de referencia y soluciones que cumplen con la normativa vigente, sin renunciar a la comodidad ni a la imagen profesional de la empresa.",
      "Además, personalizamos las prendas con el logotipo de tu empresa para que tu equipo trabaje protegido y, al mismo tiempo, refuerce la identidad corporativa.",
    ],
    catalogs: [
      {
        brand: "Projob",
        title: "Catálogo Projob Workwear 2026",
        image: "/images/catalogs/123.jpg",
        imageAlt: "Portada del catálogo Projob Workwear Collection 2026",
        href: "https://drive.google.com/uc?export=download&id=1Xyg__vQMZLC-lv2phYbar2XrtD0aWrgB",
      },
      {
        brand: "Roly",
        title: "Catálogo Roly alta visibilidad",
        image: "/images/catalogs/ALTA-VISIBILITAT_ROLYWORK.BOTO_.png",
        imageAlt: "Catálogo Roly de prendas de alta visibilidad",
        href: "https://drive.google.com/uc?export=download&id=1R8heVJKR3wZSv1LtQSW9aFZDzQAFU8NY",
      },
      {
        brand: "Velilla",
        title: "Catálogo Velilla alta visibilidad",
        image: "/images/catalogs/ALTA-VISIBILITAT_VELILLA.BOTO_.png",
        imageAlt: "Catálogo Velilla de prendas de alta visibilidad",
        href: "https://drive.google.com/uc?export=download&id=1Y-Gd_9UNtoK_5V_nDocT6e7_M60i9TD2",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam alta visibilidad",
        image: "/images/catalogs/ALTA-VISIBILITAT_WORKTEAM.BOTO_.png",
        imageAlt: "Catálogo Workteam de prendas de alta visibilidad",
        href: "https://drive.google.com/uc?export=download&id=1yX18h5j65EONVmdg1kXIb7AAByrufwKK",
      },
    ],
  },
  {
    slug: "calzado-de-trabajo",
    title: "Calzado de trabajo",
    eyebrow: "Catálogos PDF",
    description:
      "El calzado de trabajo es una pieza clave para garantizar la seguridad, el confort y el bienestar de los profesionales en su día a día. En muchos sectores, pasar horas de pie, caminar constantemente o trabajar en entornos exigentes hace imprescindible disponer de un calzado adecuado, resistente y cómodo.",
    paragraphs: [
      "En Bogerd Pro ofrecemos calzado de trabajo pensado para adaptarse a las necesidades de cada sector, desde la industria y la logística hasta la hostelería, la sanidad, los servicios o el mantenimiento. Nuestra gama incluye zapatos de seguridad, botas, calzado ocupacional y modelos más ligeros y flexibles, siempre con un equilibrio óptimo entre protección, ergonomía y diseño.",
      "Trabajamos con soluciones que incorporan características como puntera de seguridad, suela antideslizante, absorción de impactos, resistencia al desgaste y materiales transpirables, para ofrecer el máximo rendimiento durante toda la jornada laboral. Porque un buen calzado no solo protege, sino que también ayuda a mejorar la comodidad y reducir la fatiga.",
      "Disponemos de modelos para distintos usos y entornos de trabajo, siempre priorizando la calidad, la funcionalidad y la imagen profesional. Porque cada paso cuenta cuando se trata de trabajar con seguridad y confianza.",
    ],
    catalogs: [
      {
        brand: "Deltaplus",
        title: "Catálogo Deltaplus",
        image: "/images/catalogs/CALCAT-DE-TREBALL_DELTAPLUS.BOTO_.png",
        imageAlt: "Catálogo Deltaplus de calzado de trabajo",
        href: "https://drive.google.com/uc?export=download&id=1daIGb77bCBoUAckIQLoNNVxyJLq-Uioz",
      },
      {
        brand: "Projob",
        title: "Catálogo Projob",
        image: "/images/catalogs/CALCAT-DE-TREBALL_PROJOB.BOTO_.png",
        imageAlt: "Catálogo Projob de calzado de trabajo",
        href: "https://drive.google.com/uc?export=download&id=1oUFgOGPKweR7XVMWkdZs96ybLoOVvSSA",
      },
      {
        brand: "Roly Footwear",
        title: "Catálogo Roly Footwear",
        image: "/images/catalogs/CALCAT-DE-TREBALL_ROLY.BOTO_.png",
        imageAlt: "Catálogo Roly Footwear de calzado de trabajo",
        href: "https://drive.google.com/uc?export=download&id=13P4xNzyNVy5fnztObGHFplS14tLhB28w",
      },
      {
        brand: "Roly WRK",
        title: "Catálogo Roly WRK",
        image: "/images/catalogs/CALCAT-DE-TREBALL_ROLYWORK.BOTO_.png",
        imageAlt: "Catálogo Roly WRK de calzado de trabajo",
        href: "https://drive.google.com/uc?export=download&id=17rhZHSMXHukdjipPJkkgrxvcDclYm_KH",
      },
      {
        brand: "Skechers",
        title: "Catálogo Skechers",
        image: "/images/catalogs/CALCAT-DE-TREBALL_SKECHERS.BOTO_.png",
        imageAlt: "Catálogo Skechers Work Footwear",
        href: "https://drive.google.com/uc?export=download&id=1iU8FR1QtN-1RKypBpjPEXWZ0b2eRG2yF",
      },
      {
        brand: "VPRO",
        title: "Catálogo VPRO",
        image: "/images/catalogs/CALCAT-DE-TREBALL_VPRO.jpg",
        imageAlt: "Catálogo VPRO de calzado de trabajo",
        imageMode: "cover",
        href: "https://drive.google.com/uc?export=download&id=19hEI6ceieazim5bsvOV8Iv7uU3p1DW86",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam",
        image: "/images/catalogs/CALCAT-DE-TREBALL_WORKTEAM.png",
        imageAlt: "Catálogo Workteam de calzado de trabajo",
        href: "https://drive.google.com/uc?export=download&id=14E0oxhZ1LTzG3eQeyd14M1k0fEbOz45Y",
      },
    ],
  },
  {
    slug: "equipos-de-proteccion",
    title: "Equipos de protección",
    eyebrow: "Catálogos PDF",
    description:
      "Los equipos de protección son esenciales para garantizar la seguridad de los profesionales en entornos de trabajo donde existen riesgos específicos. Proteger correctamente a los trabajadores no solo ayuda a prevenir accidentes, sino que también es clave para cumplir la normativa y desarrollar la actividad con confianza y tranquilidad.",
    paragraphs: [
      "En Bogerd Pro ofrecemos equipos de protección adaptados a las necesidades de distintos sectores como la industria, la construcción, la logística, el mantenimiento, los servicios técnicos, los talleres o los trabajos al aire libre. Disponemos de una amplia gama de soluciones para proteger las diferentes partes del cuerpo frente a riesgos mecánicos, químicos, térmicos, acústicos o de caída.",
      "Nuestra oferta incluye protección de la cabeza, protección ocular, protección auditiva, protección respiratoria, guantes, calzado de seguridad, ropa de protección y sistemas anticaídas. Trabajamos con marcas de referencia y productos homologados que combinan seguridad, ergonomía y comodidad, para que la protección sea efectiva sin limitar la movilidad ni el rendimiento del profesional.",
      "Asesoramos a cada cliente para encontrar la solución más adecuada según el tipo de trabajo, el entorno y los riesgos asociados, con el objetivo de ofrecer una protección fiable y adaptada a cada realidad profesional.",
    ],
    catalogs: [
      {
        brand: "Deltaplus",
        title: "Equipos de protección anticaídas",
        image: "/images/catalogs/PROTECCIO-ANTICAIGUDA_DELTAPLUS.png",
        imageAlt: "Profesionales usando equipos anticaídas en fachada",
        href: "https://drive.google.com/uc?export=download&id=1PpO4l18hgIHmhM-Y-PwuoBsO4t0zUlIE",
      },
      {
        brand: "Deltaplus",
        title: "Equipos de protección auditiva",
        image: "/images/catalogs/PROTECCIO-AUDITIVA_DELTAPLUS.png",
        imageAlt: "Operario en planta industrial con equipo de protección",
        href: "https://drive.google.com/uc?export=download&id=15CMZnBQaRSQnaBc79Mej7SwH4_pdVNWt",
      },
      {
        brand: "Deltaplus",
        title: "Equipos de protección de las manos",
        image: "/images/catalogs/PROTECCIO-DE-LES-MANS_DELTAPLUS.png",
        imageAlt: "Guantes de protección para manipulación de metal",
        href: "https://drive.google.com/uc?export=download&id=1WZ9tiXkSk6cfoKSoqy-THnZ6kxURtyTc",
      },
      {
        brand: "Workteam",
        title: "Equipos de protección de las manos",
        image: "/images/catalogs/PROTECCIO-DE-LES-MANS_WORKTEAM.png",
        imageAlt: "Guantes técnicos de protección contra corte",
        href: "https://drive.google.com/uc?export=download&id=1Ehr3VVWTNzwR2xeR8viSgNM9YJ_cem6y",
      },
      {
        brand: "Deltaplus",
        title: "Equipos de protección de la cabeza",
        image: "/images/catalogs/PROTECCIO-DEL-CAP_DELTAPLUS.png",
        imageAlt: "Profesional con casco de protección en exterior",
        href: "https://drive.google.com/uc?export=download&id=1S8Fg3UvUWRVITl9myZPhDjw1HQSnuQ8c",
      },
      {
        brand: "Workteam",
        title: "Equipos de protección de la cabeza",
        image: "/images/catalogs/PROTECCIO-DEL-CAP_WORKTEAM.png",
        imageAlt: "Equipo con casco y guantes en andamio",
        href: "https://drive.google.com/uc?export=download&id=1kpKKNJJ_PzgZv60SWNYLz8dmvbidulgj",
      },
      {
        brand: "Deltaplus",
        title: "Equipos de protección ocular",
        image: "/images/catalogs/PROTECCIO-OCULAR_DELTAPLUS.png",
        imageAlt: "Profesional soldando con protección ocular",
        href: "https://drive.google.com/uc?export=download&id=1HKkp-X7T_FYTZZ2zojn1krqN-FjZYe-S",
      },
      {
        brand: "Deltaplus",
        title: "Equipos de protección respiratoria",
        image: "/images/catalogs/PROTECCIO-RESPIRATORIA_DELTAPLUS.png",
        imageAlt: "Catálogo Deltaplus de equipos de protección respiratoria",
        href: "https://drive.google.com/uc?export=download&id=1v2YKic3UTQl3gxxzO9CMiCRqP8aLiHm4",
      },
    ],
  },
  {
    slug: "hosteleria-y-restauracion",
    title: "Hostelería y restauración",
    eyebrow: "Catálogos PDF",
    description:
      "El vestuario de hostelería y restauración es una pieza clave para transmitir profesionalidad, cuidar la imagen del negocio y garantizar la comodidad de los equipos durante toda la jornada. En un sector donde la presentación, la atención al cliente y la funcionalidad son esenciales, disponer de una ropa adecuada marca la diferencia.",
    paragraphs: [
      "En Bogerd Pro ofrecemos vestuario para hostelería y restauración pensado para adaptarse a las necesidades de bares, restaurantes, cafeterías, hoteles, cáterings, panaderías, pastelerías y otros negocios del sector. Nuestra gama incluye camisas, polos, delantales, pantalones, chaquetas de cocina, batas, camisetas y otras prendas laborales que combinan comodidad, resistencia y una imagen cuidada.",
      "Trabajamos con tejidos prácticos, fáciles de mantener y preparados para soportar un uso intensivo y lavados frecuentes, sin renunciar a la estética ni al confort. Disponemos de modelos clásicos y actuales, con distintos estilos, colores y acabados, para que cada establecimiento pueda reflejar su personalidad y reforzar su identidad corporativa.",
      "Además, personalizamos las prendas con el logotipo de tu negocio para ayudarte a crear una imagen uniforme, coherente y profesional, tanto en sala como en cocina o en el servicio de atención al cliente.",
    ],
    catalogs: [
      {
        brand: "Gary's",
        title: "Catálogo Gary's",
        image: "/images/catalogs/HORECA_GARY_S.png",
        imageAlt: "Catálogo Gary's de hostelería y restauración",
        href: "https://drive.google.com/uc?export=download&id=1-A6dUlyv-OItTU8dHLhbfHOAjFl61e4o",
      },
      {
        brand: "Gastrochef",
        title: "Catálogo Gastrochef",
        image: "/images/catalogs/HORECA_GASTROCHEF.png",
        imageAlt: "Catálogo Gastrochef de hostelería y restauración",
        href: "https://drive.google.com/uc?export=download&id=1032oiE7Twd4SQNPIw8TSyiQF4tszahdB",
      },
      {
        brand: "J. Harvest & Frost",
        title: "Catálogo J. Harvest & Frost",
        image: "/images/catalogs/HORECA_J.HARVESTFROST.png",
        imageAlt: "Catálogo J. Harvest & Frost para hostelería",
        href: "https://drive.google.com/uc?export=download&id=11tQaq3ULsXMUasoQXNeTmzRFyfkGu-cD",
      },
      {
        brand: "Roly WRK",
        title: "Catálogo Roly WRK",
        image: "/images/catalogs/HORECA_ROLYWORK.png",
        imageAlt: "Catálogo Roly WRK para hostelería y restauración",
        href: "https://drive.google.com/uc?export=download&id=1YeKtvJoBhZi8JJk4dhu0uqDECVQTAM_a",
      },
      {
        brand: "Velilla",
        title: "Catálogo Velilla",
        image: "/images/catalogs/HORECA_VELILLA.png",
        imageAlt: "Catálogo Velilla para hostelería y restauración",
        href: "https://drive.google.com/uc?export=download&id=1ofDmnROZtO7GSeiWhi5Ro8JjTyxTFuEA",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam",
        image: "/images/catalogs/HORECA_WORKTEAM.png",
        imageAlt: "Catálogo Workteam para hostelería y restauración",
        href: "https://drive.google.com/uc?export=download&id=1TTalHIbjuFFyD7xkOKmuIHeOUzTR3_lT",
      },
    ],
  },
  {
    slug: "industria-construccion-y-logistica",
    title: "Industria, construcción y logística",
    eyebrow: "Catálogos PDF",
    description:
      "El vestuario para industria, construcción y logística está pensado para responder a las exigencias de sectores donde la resistencia, la funcionalidad y la seguridad son imprescindibles. En entornos de trabajo intensos y dinámicos, es fundamental disponer de prendas preparadas para ofrecer comodidad, durabilidad y libertad de movimiento durante toda la jornada.",
    paragraphs: [
      "En Bogerd Pro ofrecemos ropa de trabajo adaptada a profesionales de la industria, la construcción, los almacenes, el transporte, la manutención, el montaje, los servicios técnicos y la logística. Nuestra gama incluye pantalones, chaquetas, chalecos, polos, camisetas, sudaderas, ropa multibolsillos y otras prendas laborales pensadas para soportar un uso intensivo y adaptarse a distintas condiciones de trabajo.",
      "Trabajamos con vestuario que combina tejidos resistentes, diseños funcionales y acabados pensados para facilitar el día a día de los profesionales. Disponemos de prendas reforzadas, cómodas y prácticas, con soluciones que ayudan a mejorar la movilidad, la organización y la imagen del equipo, sin renunciar a la robustez que estos sectores necesitan.",
      "Además, personalizamos las prendas con el logotipo de tu empresa para que tu equipo proyecte una imagen profesional, uniforme y coherente, tanto en las instalaciones como ante los clientes.",
    ],
    catalogs: [
      {
        brand: "Printer",
        title: "Catálogo Printer",
        image: "/images/catalogs/INDUSTRIA-CONSTRUCCIO-I-LOGISTICA_PRINTER.png",
        imageAlt: "Catálogo Printer para industria, construcción y logística",
        href: "https://drive.google.com/uc?export=download&id=1W9ahCnoyZzHEpDBAOuPCZ0yZhKJdexya",
      },
      {
        brand: "Projob",
        title: "Catálogo Projob",
        image: "/images/catalogs/INDUSTRIA-CONSTRUCCIO-I-LOGISTICA_PROJOB.png",
        imageAlt: "Catálogo Projob para industria, construcción y logística",
        href: "https://drive.google.com/uc?export=download&id=1it4rBVhl2unhnx2LjTUXffo5B0itXLWw",
      },
      {
        brand: "Roly Work",
        title: "Catálogo Roly Work",
        image: "/images/catalogs/INDUSTRIA-CONSTRUCCIO-I-LOGISTICA_ROLY-WORK.png",
        imageAlt: "Catálogo Roly Work para industria, construcción y logística",
        href: "https://drive.google.com/uc?export=download&id=1BCqrJ9uBGERw4vvZOEVzi5aG6JpYXOg6",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam",
        image: "/images/catalogs/INDUSTRIA-CONSTRUCCIO-I-LOGISTICA_WORKTEAM.png",
        imageAlt: "Catálogo Workteam para industria, construcción y logística",
        href: "https://drive.google.com/uc?export=download&id=1Ww4RnuKjdlu2VzQ8djhsgRwIv4EWkiLk",
      },
      {
        brand: "Velilla",
        title: "Catálogo Velilla",
        image: "/images/catalogs/INDUSTRIA-CONSTRUCCIO-I-LOGISTICA.VELILLA.png",
        imageAlt: "Catálogo Velilla para industria, construcción y logística",
        href: "https://drive.google.com/uc?export=download&id=1hnn1Nj8taQuKyNF_Q_PixSsUu7UKEpNU",
      },
    ],
  },
  {
    slug: "sanidad-y-servicios",
    title: "Sanidad y servicios",
    eyebrow: "Catálogos PDF",
    description:
      "El vestuario de sanidad y servicios está pensado para ofrecer comodidad, higiene y una imagen profesional en entornos donde la atención a las personas, la funcionalidad y la presentación son fundamentales. Es una categoría especialmente indicada para sectores como hospitales, clínicas, consultas médicas, clínicas dentales y dentistas, residencias, centros de estética, limpieza profesional, servicios asistenciales o atención al público.",
    paragraphs: [
      "En Bogerd Pro ofrecemos vestuario de sanidad y servicios diseñado para adaptarse al ritmo de trabajo de los profesionales que necesitan prendas cómodas, resistentes y prácticas para su día a día. Nuestra gama incluye casacas, pantalones, batas, túnicas, delantales y otras prendas laborales que combinan funcionalidad, libertad de movimiento y una imagen cuidada.",
      "Trabajamos con tejidos agradables, fáciles de mantener y pensados para soportar un uso intensivo y lavados frecuentes, sin renunciar al confort ni a la estética. Disponemos de modelos clásicos y actuales, con distintos colores, patronajes y acabados, para que cada empresa pueda transmitir profesionalidad y coherencia con su imagen corporativa.",
      "Además, personalizamos las prendas con el logotipo de tu empresa para reforzar la identidad de marca y ofrecer una imagen uniforme, cercana y profesional ante clientes, pacientes o usuarios.",
    ],
    catalogs: [
      {
        brand: "Gary's",
        title: "Catálogo Gary's",
        image: "/images/catalogs/SANITAT-I-SERVEIS_GARY_S.png",
        imageAlt: "Catálogo Gary's de sanidad y servicios",
        href: "https://drive.google.com/uc?export=download&id=17suMwjB3lXZ_UA_nLeY6OjzuvpkxorgX",
      },
      {
        brand: "Roly Work",
        title: "Catálogo Roly Work",
        image: "/images/catalogs/SANITAT-I-SERVEIS_ROLY-WORK.png",
        imageAlt: "Catálogo Roly Work de sanidad y servicios",
        href: "https://drive.google.com/uc?export=download&id=1_hEr3dsaPkOTUC3NFuyO0peXKq0PAmZY",
      },
      {
        brand: "Velilla",
        title: "Catálogo Velilla",
        image: "/images/catalogs/SANITAT-I-SERVEIS_VELILLA.BOTO_.png",
        imageAlt: "Catálogo Velilla de sanidad y servicios",
        href: "https://drive.google.com/uc?export=download&id=1UM3V20jBk15pYV4Qesk7kw7bZOtOwVre",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam",
        image: "/images/catalogs/SALUT-I-SERVEIS_WORKTEAM.BOTO_.png",
        imageAlt: "Catálogo Workteam de sanidad y servicios",
        href: "https://drive.google.com/uc?export=download&id=1MSQNgk_NGwARwHBnkhCLxragYf5r9tCh",
      },
    ],
  },
  {
    slug: "sport-casual-promo-y-eventos",
    title: "Sport, casual & promo y eventos",
    eyebrow: "Catálogos PDF",
    description:
      "El vestuario sport, casual y de promoción es ideal para empresas y organizaciones que buscan una imagen actual, cómoda y coherente con su marca. Son prendas pensadas tanto para el día a día como para eventos, acciones promocionales, equipos comerciales, ferias, clubs, asociaciones o campañas corporativas.",
    paragraphs: [
      "En Bogerd Pro ofrecemos una amplia gama de prendas sport, casual y promocionales que combinan comodidad, estilo y versatilidad. Disponemos de camisetas, polos, sudaderas, chaquetas, gorras, chalecos y otros artículos textiles pensados para reforzar la identidad visual de tu empresa o proyecto con una imagen moderna y profesional.",
      "Trabajamos con prendas adaptadas a distintos usos y públicos, desde ropa corporativa informal hasta vestuario para promociones, eventos o merchandising. Nuestra oferta incluye distintos estilos, colores, tejidos y acabados para crear soluciones que se ajusten a cada necesidad y tipo de acción.",
      "Además, personalizamos las prendas con el logotipo, mensaje o diseño de tu marca para que puedas comunicarte de forma visual, coherente y atractiva. Es una manera efectiva de reforzar la visibilidad de la empresa y generar imagen de marca dentro y fuera del entorno profesional.",
    ],
    catalogs: [
      {
        brand: "Clique",
        title: "Catálogo Clique",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-EVENTS_CLIQUE.png",
        imageAlt: "Catálogo Clique de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1esae8uTUKSo960px5FfkOTZoRH2qhmB9",
      },
      {
        brand: "Untagged Movement",
        title: "Catálogo Untagged Movement",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-EVENTS_UNTAGGED.png",
        imageAlt: "Catálogo Untagged Movement de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=11iwsY8CubEMIDxMJLAgocwS9sabEzOoe",
      },
      {
        brand: "Craft",
        title: "Catálogo Craft",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_CRAFT.png",
        imageAlt: "Catálogo Craft de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1JtLnl5nw6etvxbnfCd-uzSSN1BNNnNK8",
      },
      {
        brand: "James Harvest",
        title: "Catálogo James Harvest",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_JAMES-HARVEST.png",
        imageAlt: "Catálogo James Harvest de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1WXxXkviJxJhvMcKXaTURFvNtI2sQTQDD",
      },
      {
        brand: "Mukua",
        title: "Catálogo Mukua",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_MUKUA.png",
        imageAlt: "Catálogo Mukua de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1FGL69QQqZZvIsbK42omFscpgkTZ6xWtC",
      },
      {
        brand: "Printer",
        title: "Catálogo Printer",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_PRINTER.png",
        imageAlt: "Catálogo Printer de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1hrOW4wu4q0eT4YEcbcvf3DF8iE4Biz8r",
      },
      {
        brand: "Roly",
        title: "Catálogo Roly",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_ROLY.png",
        imageAlt: "Catálogo Roly de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1GrlVvGx1WbY6uf2O2SApKeaXtnWX4vor",
      },
      {
        brand: "Tenson",
        title: "Catálogo Tenson",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_TENSON.png",
        imageAlt: "Catálogo Tenson de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1Hag6-MlHKxj5HRpbRDTDlKQQfYqaFMd2",
      },
      {
        brand: "Workteam",
        title: "Catálogo Workteam",
        image: "/images/catalogs/SPORT-CASUAL-PROMO-I-EVENTS_WORKTEAM.png",
        imageAlt: "Catálogo Workteam de sport, casual, promo y eventos",
        href: "https://drive.google.com/uc?export=download&id=1Q5wgh81ZzYtItXY8w75Kg9Fi3h183QXq",
      },
    ],
  },
];
