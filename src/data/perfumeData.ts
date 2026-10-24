export interface PerfumeIngredient {
  id: string;
  name: string;
  scientificName: string;
  scentFamily: string;
  tier: 'top' | 'heart' | 'base';
  description: string;
  color: string;
  ifraMaxPercent: number; // Maximum dermal level (%) in finished hydroalcoholic product (IFRA Category 4)
  chemicalCompounds?: string; // Main chemical constituents & molecular weight
  volatilityNote?: string; // Volatility & vapor pressure note
  observedLabNote?: string; // Olfactory characteristic observed in the group's lab experiment
  ifraTechnicalReference?: string; // Technical reference source (IFRA 51st Amendment Cat. 4 / Tisserand & Young)
}

export interface ExperimentalBaselineFormula {
  title: string;
  batchCode: string;
  authors: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  totalVolume: number;
  concentrationName: string;
  concentrationPercent: number;
  slots: {
    top1: { id: string; percentage: number; observedNote: string };
    top2: { id: string; percentage: number; observedNote: string };
    heart1: { id: string; percentage: number; observedNote: string };
    heart2: { id: string; percentage: number; observedNote: string };
    base1: { id: string; percentage: number; observedNote: string };
    base2: { id: string; percentage: number; observedNote: string };
  };
  initialEvaluation: {
    physicalState: string;
    scentEvolution: string;
    strengths: string;
    pointsToImprove: string;
    panelScore: string;
  };
}

export interface SeasonalTemplate {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  title: string;
  subtitle: string;
  description: string;
  recommendedTiers: { top: number; heart: number; base: number };
  defaultFormula: {
    top1: { id: string; percentage: number };
    top2: { id: string; percentage: number };
    heart1: { id: string; percentage: number };
    heart2: { id: string; percentage: number };
    base1: { id: string; percentage: number };
    base2: { id: string; percentage: number };
  };
}

export const FLORIS_IMAGES = {
  // Brand & Official Posters
  poster: import.meta.env.BASE_URL + 'assets/aistudio/8290b5aa.png', // Poster chính thức chai Floris 10 mL và hoa anh đào
  logoEmblem: import.meta.env.BASE_URL + 'assets/aistudio/404d5511.png', // Con dấu / Logo tròn Floris Eau De Parfum
  scentStillLife: import.meta.env.BASE_URL + 'assets/aistudio/jasmine_peach_vanilla_scent_art.jpg', // Tác phẩm nghệ thuật 4 nốt hương (Nhài, Đào, Vani, Xạ hương)
  atelierBench: import.meta.env.BASE_URL + 'assets/aistudio/perfume_atelier_bench.jpg', // Không gian bàn pha chế phòng lab

  // Real Experimental Bottles (Tổ 1 - 12A13)
  sampleA: import.meta.env.BASE_URL + 'assets/aistudio/7b513f70.png', // Chai nước hoa thực tế nhãn "Mẫu A"
  sampleC: import.meta.env.BASE_URL + 'assets/aistudio/83106fcd.png', // Chai nước hoa thực tế nhãn "mẫu C"
  sampleB: import.meta.env.BASE_URL + 'assets/aistudio/758aa176.png', // Chai chiết 10 mL thực tế trên tay

  // Real Laboratory Processes
  infographic9Steps: import.meta.env.BASE_URL + 'assets/aistudio/4a90ae30.png', // Infographic chuẩn 9 bước sản xuất Floris
  pipetteDroppingTestTube: import.meta.env.BASE_URL + 'assets/aistudio/6d8dd347.png', // Thực hành nhỏ giọt tinh dầu "LÀI" & "VANI" vào ống nghiệm
  verticalPipetteSolvent: import.meta.env.BASE_URL + 'assets/aistudio/0f1d3808.png', // Nhỏ giọt góc 90° khảo sát dung môi và nước cất
  clarityInspectionCup: import.meta.env.BASE_URL + 'assets/aistudio/320a4e50.png', // Kiểm tra độ trong suốt không đục của cốc dung môi
};

export const INGREDIENT_CATALOG: Record<'top' | 'heart' | 'base', PerfumeIngredient[]> = {
  top: [
    {
      id: 'top_jasmine',
      name: 'Hoa nhài 🌼 (Jasmine Top Note)',
      scientificName: 'Jasminum sambac',
      scentFamily: 'Hoa Cỏ Tươi Sáng (Fresh Floral)',
      tier: 'top',
      description: 'Hương hoa thanh thoát, mềm mại, có nét ngọt dịu mở đầu cho hành trình hương thơm mùa xuân.',
      color: '#FEF08A',
      ifraMaxPercent: 4.0,
      chemicalCompounds: 'Benzyl acetate (C₉H₁₀O₂, M=150 g/mol), Linalool (C₁₀H₁₈O), Cis-Jasmone',
      volatilityNote: 'Ester Benzyl acetate bay hơi nhanh ở tầng đầu, tạo ấn tượng ban đầu tươi sáng và thu hút.',
      observedLabNote: 'Hoa nhài 🌼 (Hương đầu Floris): Mở đầu nhẹ nhàng, tinh tế và trong trẻo ngay khi xịt.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): An toàn trên da ở mức ≤ 4.0% trong thành phẩm nước hoa.',
    },
    {
      id: 'top_jasmine_fresh',
      name: 'Hoa nhài Trắng 🌼 (Fresh Jasmine Sambac)',
      scientificName: 'Jasminum sambac',
      scentFamily: 'Hoa Cỏ Trắng Tươi Mới (White Floral)',
      tier: 'top',
      description: 'Trong trẻo, thanh tao, tựa như những búp nhài ngậm sương sớm đầu xuân.',
      color: '#FDE047',
      ifraMaxPercent: 4.0,
      chemicalCompounds: 'Benzyl acetate, Linalool, Methyl anthranilate',
      volatilityNote: 'Khuếch tán mạnh trong 10–20 phút đầu, mang lại cảm giác dễ chịu và tự nhiên.',
      observedLabNote: 'Hoa nhài Trắng 🌼: Tạo nét tươi mới, thanh thoát, phù hợp hoàn hảo với chủ đề Mùa Xuân.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn ≤ 4.0% trong sản phẩm hoàn chỉnh.',
    },
    {
      id: 'top_pear',
      name: 'Lê 🍐 (Pear Accord)',
      scientificName: 'Pyrus communis',
      scentFamily: 'Trái Cây Tươi Mát (Fruity Fresh)',
      tier: 'top',
      description: 'Mọng nước, ngọt thanh nhẹ nhàng và trong trẻo như sương sớm mùa xuân.',
      color: '#A3E635',
      ifraMaxPercent: 10.0,
      chemicalCompounds: 'Hexyl acetate (C₈H₁₆O₂, M=144 g/mol), Ethyl (2E,4Z)-decadienoate (ester đặc trưng của quả lê chín)',
      volatilityNote: 'Các ester mạch ngắn và trung bình có áp suất hơi cao, tỏa hương trái cây tươi mát ngay trong 15–30 phút đầu.',
      observedLabNote: 'Lê 🍐 (15% hỗn hợp hương | 3% thành phẩm | 0,30 mL / 10mL): Hương quả lê tươi mới, ngọt thanh và trong trẻo ngay khi xịt.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Các ester hương lê (Hexyl acetate, Pear ester) có độ an toàn cao trên da (≤ 10.0% trong thành phẩm nước hoa).',
    },
    {
      id: 'top_bergamot',
      name: 'Bergamot 🍋 (Cam Bergamot)',
      scientificName: 'Citrus bergamia',
      scentFamily: 'Cam Chanh (Citrus)',
      tier: 'top',
      description: 'Thanh khiết, lấp lánh, tươi mới nhẹ nhàng với chút vị thanh tao đặc trưng.',
      color: '#EAB308',
      ifraMaxPercent: 0.4, // IFRA Cat 4 limit for expressed Bergamot oil due to bergapten
      chemicalCompounds: 'D-Limonene (C₁₀H₁₆, M=136 g/mol), Linalyl acetate (C₁₂H₂₀O₂), Linalool, Bergapten',
      volatilityNote: 'Độ bay hơi cao (Áp suất hơi lớn, phân tử khối nhỏ), khuếch tán mạnh trong 15–30 phút đầu.',
      observedLabNote: 'Bergamot 🍋 (15% hỗn hợp hương | 3% thành phẩm | 0,30 mL / 10mL): Mùi cam chanh thanh mát hòa quyện cùng hương Lê tạo mở đầu tươi mới, trong trẻo.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Kiểm tra SDS/IFRA trước khi dùng vì Bergamot ép lạnh tự nhiên có nguy cơ quang độc (giới hạn 0.4% do Bergapten); sử dụng loại Bergamot FCF (đã tách furocoumarin) an toàn tới 15% thành phẩm.',
    },
    {
      id: 'top_lemon',
      name: 'Chanh Vàng Sicily',
      scientificName: 'Citrus limon',
      scentFamily: 'Cam Chanh (Citrus)',
      tier: 'top',
      description: 'Sảng khoái, sắc nét, đánh thức giác quan ngay từ giây đầu tiên.',
      color: '#FACC15',
      ifraMaxPercent: 2.0,
      chemicalCompounds: 'D-Limonene (~65%, C₁₀H₁₆), β-Pinene, γ-Terpinene, Citral (Geranial + Neral)',
      volatilityNote: 'Monoterpene không phân cực, khối lượng phân tử nhỏ (136 g/mol), bay hơi cực nhanh ở đầu pha.',
      observedLabNote: 'Mùi chanh vàng tươi sáng, sắc nét, tạo cảm giác mát lạnh tức thì trong 10–20 phút đầu.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn 2.0% trong sản phẩm hoàn chỉnh trên da đối với tinh dầu vỏ chanh ép lạnh (do hàm lượng oxypeucedanin và citral).',
    },
    {
      id: 'top_orange',
      name: 'Cam Ngọt Valencia',
      scientificName: 'Citrus sinensis',
      scentFamily: 'Cam Chanh (Citrus)',
      tier: 'top',
      description: 'Mọng nước, ngọt ngào rực rỡ, mang nguồn năng lượng ấm áp.',
      color: '#FB923C',
      ifraMaxPercent: 8.0,
      chemicalCompounds: 'D-Limonene (>90%, C₁₀H₁₆), Myrcene, Octanal, Decanal (aldehyde mạch ngắn)',
      volatilityNote: 'Bay hơi nhanh, các aldehyde C8–C10 tạo sắc thái vỏ cam mọng nước tươi sáng.',
      observedLabNote: 'Mùi cam chín ngọt dịu, dễ chịu, ít chua hơn chanh vàng, rõ nhất trong 15 phút đầu.',
      ifraTechnicalReference: 'Tisserand & Young (Essential Oil Safety, 2nd Ed.) & IFRA Cat. 4: Cam ngọt ép lạnh không gây quang độc tính mạnh như Bergamot; khuyến nghị <8% trong thành phẩm và cần chống oxy hóa D-Limonene.',
    },
    {
      id: 'top_mandarin',
      name: 'Quýt Hồng Mandarin',
      scientificName: 'Citrus reticulata',
      scentFamily: 'Cam Chanh (Citrus)',
      tier: 'top',
      description: 'Ngọt dịu, vui tươi, gợi cảm giác mọng nước êm ái.',
      color: '#F97316',
      ifraMaxPercent: 5.0,
      chemicalCompounds: 'D-Limonene, γ-Terpinene, Methyl N-methylanthranilate (ester tạo mùi quýt đặc trưng)',
      volatilityNote: 'Độ bay hơi cao nhưng êm hơn chanh nhờ ester thơm chứa nitơ.',
      observedLabNote: 'Mùi quýt ngọt thanh, êm dịu, trẻ trung, hòa quyện nhanh với cồn Ethanol.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn Dimethyl anthranilate vì tính nhạy cảm ánh sáng; tổng tinh dầu quýt khuyến nghị ≤ 5.0% trong sản phẩm hoàn chỉnh.',
    },
    {
      id: 'top_neroli',
      name: 'Hoa Cam Neroli',
      scientificName: 'Citrus aurantium amara',
      scentFamily: 'Hoa Cỏ Tươi (Fresh Floral)',
      tier: 'top',
      description: 'Thanh lịch quý phái, vừa mang nốt xanh mát vừa phảng phất hương hoa.',
      color: '#A3E635',
      ifraMaxPercent: 4.0,
      chemicalCompounds: 'Linalool (C₁₀H₁₈O, alcohol bậc ba), Linalyl acetate, β-Pinene, trans-Nerolidol',
      volatilityNote: 'Độ bay hơi trung bình–cao; nhóm -OH của Linalool tạo liên kết hydro nhẹ giúp chuyển tiếp mượt từ Tầng Đầu sang Tầng Giữa.',
      observedLabNote: 'Hương hoa trắng thanh khiết pha nét xanh lá tươi mát, giữ mùi tốt từ phút thứ 5 đến phút 40, làm cầu nối rất êm với hương hoa hồng.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4) & EU Cosmetics Reg. 1223/2009: Tinh dầu chưng cất lôi cuốn hơi nước không chứa furanocoumarin; giới hạn theo hàm lượng Linalool và Geraniol (~4.0% trong thành phẩm).',
    },
    {
      id: 'top_peppermint',
      name: 'Bạc Hà Băng',
      scientificName: 'Mentha piperita',
      scentFamily: 'Tươi Mát / Thảo Mộc (Fresh)',
      tier: 'top',
      description: 'The mát bừng sáng, tạo hiệu ứng làm dịu nhiệt độ cơ thể tức thì.',
      color: '#2DD4BF',
      ifraMaxPercent: 3.0,
      chemicalCompounds: 'L-Menthol (C₁₀H₂₀O, M=156 g/mol), Menthone, 1,8-Cineole (Eucalyptol)',
      volatilityNote: 'Áp suất hơi khá cao; kích hoạt thụ thể lạnh TRPM8 ở niêm mạc mũi tạo cảm giác the mát.',
      observedLabNote: 'Cảm giác the mát rõ rệt, thông thoáng, giúp giảm ngay cảm giác nồng ngọt của công thức.',
      ifraTechnicalReference: 'Tisserand & Young (Essential Oil Safety): Khuyến nghị tối đa 3.0% trên da để tránh kích ứng lạnh hoặc nhạy cảm da do Menthol và Pulegone vết.',
    },
    {
      id: 'top_pinkpepper',
      name: 'Tiêu Hồng Bourbon',
      scientificName: 'Schinus terebinthifolius',
      scentFamily: 'Gia Vị Tươi (Fresh Spicy)',
      tier: 'top',
      description: 'Cay nhẹ thanh mảnh, có vị trái cây mọng quyến rũ, hiện đại.',
      color: '#FB7185',
      ifraMaxPercent: 2.5,
      chemicalCompounds: 'α-Phellandrene, δ-3-Carene, Limonene, β-Myrcene',
      volatilityNote: 'Monoterpene mạch vòng bay hơi nhanh, tạo hiệu ứng cay ấm lấp lánh ở tầng mở đầu.',
      observedLabNote: 'Cay dịu hiện đại, hơi giống quả mọng khô, không gây hắc như tiêu đen.',
      ifraTechnicalReference: 'IFRA Cat. 4 Technical Data: Khuyến nghị sử dụng ≤ 2.5% trong sản phẩm hoàn chỉnh để kiểm soát khả năng mẫn cảm từ nhóm monoterpene bị oxy hóa.',
    },
    {
      id: 'top_cardamom',
      name: 'Bạch Đậu Khấu Xanh',
      scientificName: 'Elettaria cardamomum',
      scentFamily: 'Gia Vị (Aromatic Spicy)',
      tier: 'top',
      description: 'Thơm ấm pha lẫn nốt the cay thanh lịch, mang phong thái vương giả.',
      color: '#84CC16',
      ifraMaxPercent: 2.0,
      chemicalCompounds: 'α-Terpinyl acetate (C₁₂H₂₀O₂), 1,8-Cineole, Linalool',
      volatilityNote: 'Độ bay hơi trung bình–cao, giữ được nét cay thanh lịch kéo dài sang đầu tầng giữa.',
      observedLabNote: 'Hương gia vị the ấm sang trọng, kết hợp tốt với cả cam chanh và hương gỗ.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Kiểm soát theo hàm lượng Citral và Terpinyl acetate tự nhiên, mức khuyến nghị thực hành ≤ 2.0% thành phẩm.',
    },
  ],
  heart: [
    {
      id: 'heart_peach',
      name: 'Đào 🍑 (Peach Accord)',
      scientificName: 'Prunus persica Accord',
      scentFamily: 'Trái Cây Mọng Nước (Fruity Heart)',
      tier: 'heart',
      description: 'Hương trái cây ngọt dịu, mọng nước, tươi tắn, mang lại nét trẻ trung, rạng rỡ của mùa xuân.',
      color: '#FDBA74',
      ifraMaxPercent: 8.0,
      chemicalCompounds: 'gamma-Undecalactone (C₁₁H₂₀O₂, aldehyde đào C14), Hexyl acetate, Linalool',
      volatilityNote: 'Lactone mạch vòng bay hơi ở tốc độ trung bình, duy trì hương đào ngọt dịu suốt 2–4 giờ ở tầng giữa.',
      observedLabNote: 'Đào 🍑 (Hương giữa Floris): Sắc thái mọng nước tươi tắn, tạo chủ đề chính và tính cách mùa xuân.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Các lactone hương đào đạt chuẩn an toàn cao trên da (≤ 8.0% thành phẩm).',
    },
    {
      id: 'heart_peach_ripe',
      name: 'Đào Mùa Xuân 🍑 (Spring Peach Blossom)',
      scientificName: 'Prunus persica',
      scentFamily: 'Trái Cây Hoa Cỏ (Fruity Floral)',
      tier: 'heart',
      description: 'Nét hoa quả ngọt dịu, tươi tắn và mềm mại, hòa quyện với hoa nhài tầng đầu.',
      color: '#FB923C',
      ifraMaxPercent: 8.0,
      chemicalCompounds: 'gamma-Decalactone, Benzaldehyde vết, Geraniol',
      volatilityNote: 'Độ bay hơi trung bình, giữ nhịp điệu cảm xúc mượt mà giữa tầng đầu và tầng cuối.',
      observedLabNote: 'Đào Mùa Xuân 🍑: Mang lại sự rạng rỡ, trong trẻo và nữ tính cho người dùng.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): An toàn trên da ≤ 8.0% thành phẩm.',
    },
    {
      id: 'heart_cherry_blossom',
      name: 'Hoa anh đào 🌸 (Cherry Blossom)',
      scientificName: 'Prunus serrulata',
      scentFamily: 'Hoa Cỏ Mùa Xuân (Spring Floral)',
      tier: 'heart',
      description: 'Nhẹ nhàng, trong trẻo, mang sắc thái cánh hoa anh đào mùa xuân thanh thoát.',
      color: '#F472B6',
      ifraMaxPercent: 5.0,
      chemicalCompounds: 'Benzaldehyde (vết hạnh nhân dịu), Phenylethyl alcohol (C₈H₁₀O), Linalool, Geraniol, Anisaldehyde',
      volatilityNote: 'Độ bay hơi trung bình; các alcohol thơm tạo liên kết hydro vừa phải giúp giữ nét hoa trong trẻo từ 30 phút đến 3 giờ.',
      observedLabNote: 'Hoa anh đào 🌸 (20% hỗn hợp hương | 4% thành phẩm | 0,40 mL / 10mL): Hương hoa xuân nhẹ nhàng, thanh khiết, lên mùi rõ và êm sau khi cồn bay hơi.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Kiểm soát theo hàm lượng Benzaldehyde và Geraniol trong tổ hợp hương (giới hạn an toàn thực hành ≤ 5.0% trong thành phẩm).',
    },
    {
      id: 'heart_jasmine',
      name: 'Hoa nhài 🌼 (Jasmine Sambac)',
      scientificName: 'Jasminum sambac',
      scentFamily: 'Hoa Cỏ Trắng (White Floral)',
      tier: 'heart',
      description: 'Thanh tao, mềm mại và quyến rũ, tôn lên vẻ trong trẻo của hoa xuân.',
      color: '#E2E8F0',
      ifraMaxPercent: 3.8,
      chemicalCompounds: 'Benzyl acetate (C₉H₁₀O₂), Linalool, Cis-Jasmone, Indole (hợp chất dị vòng nitơ)',
      volatilityNote: 'Độ bay hơi trung bình–thấp; Benzyl acetate và Cis-Jasmone tạo độ tỏa hương (sillage) ổn định và bền.',
      observedLabNote: 'Hoa nhài 🌼 (20% hỗn hợp hương | 4% thành phẩm | 0,40 mL / 10mL): Hòa quyện cùng Hoa anh đào tạo tầng hương giữa tròn trịa, thanh nhã.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn 3.8% đối với Jasmine Sambac Absolute tự nhiên; hợp hương Hoa nhài đã chuẩn hóa IFRA an toàn ở mức 4.0% thành phẩm.',
    },
    {
      id: 'heart_rose',
      name: 'Hoa Hồng Grasse (Rose de Mai)',
      scientificName: 'Rosa centifolia',
      scentFamily: 'Hoa Cỏ (Floral)',
      tier: 'heart',
      description: 'Nữ hoàng của các loài hoa, hương thơm đằm thắm, mật ngọt và sang trọng.',
      color: '#F43F5E',
      ifraMaxPercent: 4.0,
      chemicalCompounds: 'Citronellol (C₁₀H₂₀O, M=156 g/mol), Geraniol (C₁₀H₁₈O), Nerol, Phenylethyl alcohol',
      volatilityNote: 'Độ bay hơi trung bình; các terpene alcohol có nhóm -OH phân cực tạo liên kết hydro giữ mùi ổn định 2–4 giờ.',
      observedLabNote: 'Nốt hoa hồng chủ đạo đằm thắm, ngọt dịu, bắt đầu tỏa rõ sau 20 phút khi lớp hương cam đầu dịu xuống.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn phụ thuộc vào hàm lượng Methyleugenol tự nhiên trong tinh dầu hoa hồng (~0.5%–4.0% trong sản phẩm hoàn chỉnh tùy lô chiết xuất).',
    },
    {
      id: 'heart_lavender',
      name: 'Oải Hương Provence',
      scientificName: 'Lavandula angustifolia',
      scentFamily: 'Thảo Mộc Thư Giãn (Aromatic)',
      tier: 'heart',
      description: 'Cân bằng, thư thái, mang phong vị đồng quê miền Nam nước Pháp.',
      color: '#A855F7',
      ifraMaxPercent: 10.0,
      chemicalCompounds: 'Linalool (30–40%), Linalyl acetate (35–45%, ester thơm), Lavandulyl acetate',
      volatilityNote: 'Độ bay hơi trung bình; cân bằng giữa ester thanh mát và alcohol dịu nhẹ.',
      observedLabNote: 'Mùi thảo mộc sạch sẽ, thư giãn, giúp làm dịu các nốt hương nồng và tạo cảm giác thoáng đãng.',
      ifraTechnicalReference: 'Tisserand & Young & IFRA Cat. 4: Độ an toàn trên da cao; cần bảo quản kín tránh Linalool tiếp xúc không khí tạo hydroperoxide gây kích ứng.',
    },
    {
      id: 'heart_ylang',
      name: 'Ngọc Lan Tây (Ylang Ylang)',
      scientificName: 'Cananga odorata',
      scentFamily: 'Hoa Nhiệt Đới (Exotic Floral)',
      tier: 'heart',
      description: 'Ngọt béo kem sữa, nồng ấm và khêu gợi bản năng lãng mạn.',
      color: '#FDE047',
      ifraMaxPercent: 0.73,
      chemicalCompounds: 'Germacrene D, Benzyl acetate, p-Cresyl methyl ether, Benzyl benzoate, Isoeugenol',
      volatilityNote: 'Chứa cả ester bay hơi vừa và sesquiterpene bay hơi chậm, tạo chiều sâu nồng ấm.',
      observedLabNote: 'Hương hoa nhiệt đới ngọt đậm, béo mịn; nếu dùng tỉ lệ cao dễ tạo cảm giác hơi nồng.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn nghiêm ngặt ở mức 0.73% trong sản phẩm hoàn chỉnh trên da do chứa Isoeugenol và Benzyl salicylate dễ gây mẫn cảm da.',
    },
    {
      id: 'heart_geranium',
      name: 'Phong Lữ Bourbon',
      scientificName: 'Pelargonium graveolens',
      scentFamily: 'Hoa Cỏ Xanh (Green Floral)',
      tier: 'heart',
      description: 'Cầu nối hoàn hảo giữa hoa hồng và nốt xanh the, tạo chiều sâu tươi mới.',
      color: '#10B981',
      ifraMaxPercent: 5.0,
      chemicalCompounds: 'Citronellol, Geraniol, Citronellyl formate, Isomenthone',
      volatilityNote: 'Độ bay hơi trung bình; chia sẻ thành phần Citronellol/Geraniol với hoa hồng nhưng thêm nốt xanh thảo mộc.',
      observedLabNote: 'Hương hoa pha lá xanh hơi the mát, giúp nốt Hoa Hồng Grasse trong công thức gốc trở nên thanh thoát, tự nhiên và không bị ngấy.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Kiểm soát theo tổng hàm lượng Geraniol và Citronellol trong thành phẩm (khuyến nghị thực hành ≤ 5.0% thành phẩm).',
    },
    {
      id: 'heart_iris',
      name: 'Rễ Diên Vĩ Florence (Orris)',
      scientificName: 'Iris pallida',
      scentFamily: 'Phấn Thơm Quý Phái (Powdery)',
      tier: 'heart',
      description: 'Hương phấn mịn màng, quý hiếm và tôn vẻ thanh cao cổ điển.',
      color: '#C084FC',
      ifraMaxPercent: 3.0,
      chemicalCompounds: 'α-Irone, β-Irone, γ-Irone (ketone terpenoid C₁₄H₂₂O, M=206 g/mol), Myristic acid',
      volatilityNote: 'Phân tử khối lớn (206 g/mol), bay hơi chậm, vừa tạo hương giữa phấn mịn vừa hỗ trợ định hương.',
      observedLabNote: 'Mùi phấn hoa mịn màng, sang trọng, giúp kết nối tầng hương hoa với tầng gỗ cuối.',
      ifraTechnicalReference: 'IFRA Technical Standards: Chiết xuất Orris an toàn ở mức thông dụng trong nước hoa (≤ 3.0% thành phẩm).',
    },
    {
      id: 'heart_cinnamon',
      name: 'Quế Ceylon',
      scientificName: 'Cinnamomum verum',
      scentFamily: 'Gia Vị Nồng (Warm Spicy)',
      tier: 'heart',
      description: 'Cay ngọt ấm áp, lan tỏa cảm giác ấm cúng như ngọn lửa mùa đông.',
      color: '#EA580C',
      ifraMaxPercent: 0.2,
      chemicalCompounds: 'trans-Cinnamaldehyde (C₉H₈O, aldehyde thơm liên hợp), Eugenol (C₁₀H₁₂O₂)',
      volatilityNote: 'Vòng benzene liên hợp với nhóm aldehyde làm giảm tốc độ bay hơi, tỏa hương ấm nóng bền bỉ.',
      observedLabNote: 'Mùi quế cay ngọt rất mạnh; chỉ cần một lượng nhỏ đã tạo hiệu ứng ấm áp rõ rệt.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Giới hạn rất thấp (~0.07%–0.2% trong sản phẩm hoàn chỉnh) do Cinnamaldehyde và Eugenol là tác nhân gây dị ứng tiếp xúc mạnh trên da.',
    },
  ],
  base: [
    {
      id: 'base_sandalwood',
      name: 'Gỗ Đàn Hương Mysore',
      scientificName: 'Santalum album',
      scentFamily: 'Gỗ Ấm (Woody)',
      tier: 'base',
      description: 'Mịn như kem, tĩnh tại, thiền định và giữ mùi cực kỳ bền lâu.',
      color: '#D97706',
      ifraMaxPercent: 15.0,
      chemicalCompounds: 'α-Santalol (50–60%, C₁₅H₂₄O, M=220 g/mol), β-Santalol (20–25%, sesquiterpene alcohol)',
      volatilityNote: 'Độ bay hơi rất thấp (Khối lượng phân tử lớn M=220 g/mol, nhiệt độ sôi >300°C). Đóng vai trò chất định hương (Fixative) giảm áp suất hơi riêng phần của các chất dễ bay hơi.',
      observedLabNote: 'Mùi gỗ ấm, ngọt dịu và mịn màng như kem; giữ mùi bền bỉ trên giấy thử từ giờ thứ 2 đến hơn 6 giờ sau.',
      ifraTechnicalReference: 'Tisserand & Young & IFRA Cat. 4: Tinh dầu Gỗ Đàn Hương (Santalum album) rất lành tính trên da, giới hạn an toàn cho phép lên tới 15% trong thành phẩm.',
    },
    {
      id: 'base_cedarwood',
      name: 'Gỗ Tuyết Tùng Virginia',
      scientificName: 'Juniperus virginiana',
      scentFamily: 'Gỗ Khô (Dry Woody)',
      tier: 'base',
      description: 'Mùi gỗ thông khô ráo, đĩnh đạc, mang phong thái vững chãi nam tính.',
      color: '#B45309',
      ifraMaxPercent: 10.0,
      chemicalCompounds: 'α-Cedrene (C₁₅H₂₄), Thujopsene, Cedrol (C₁₅H₂₆O, M=222 g/mol, sesquiterpene alcohol)',
      volatilityNote: 'Sesquiterpene 3 vòng có khối lượng phân tử lớn (204–222 g/mol), bay hơi chậm, tạo khung gỗ khô thanh lịch.',
      observedLabNote: 'Mùi gỗ khô, sạch sẽ (gợi nhớ mùi gỗ bút chì cao cấp), giúp giảm độ ngọt nồng và tăng nét cá tính.',
      ifraTechnicalReference: 'IFRA Cat. 4 Technical Data: Tinh dầu Tuyết Tùng Virginia an toàn và ổn định, khuyến nghị thực hành ≤ 10.0% trong thành phẩm.',
    },
    {
      id: 'base_patchouli',
      name: 'Hoắc Hương Indonesia',
      scientificName: 'Pogostemon cablin',
      scentFamily: 'Hương Đất & Gỗ (Earthy Woody)',
      tier: 'base',
      description: 'Mùi đất sau mưa, hơi the tối bí ẩn, làm nền cho các dòng nước hoa Chypre kinh điển.',
      color: '#047857',
      ifraMaxPercent: 8.0,
      chemicalCompounds: 'Patchoulol (Patchouli alcohol, C₁₅H₂₆O, M=222 g/mol), α-Bulnesene, α-Guaiene',
      volatilityNote: 'Độ bay hơi cực thấp; cấu trúc sesquiterpene tricyclic giữ hương lâu trên da và sợi vải.',
      observedLabNote: 'Hương gỗ trầm ấm pha chút mùi lá khô và đất ẩm sau mưa, tăng độ bám tỏa rõ rệt.',
      ifraTechnicalReference: 'Tisserand & Young (Essential Oil Safety): Không gây quang độc tính hay kích ứng mạnh, khuyến nghị ≤ 8.0% trong thành phẩm nước hoa.',
    },
    {
      id: 'base_amber',
      name: 'Hổ Phách Hoàng Gia (Amber)',
      scientificName: 'Amber Labdanum Accord',
      scentFamily: 'Phương Đông (Oriental Amber)',
      tier: 'base',
      description: 'Ấm áp, ngọt bùi của nhựa thông và vani, tỏa sáng như giọt mật thời gian.',
      color: '#B45309',
      ifraMaxPercent: 10.0,
      chemicalCompounds: 'Labdanol (diterpene), Ambroxan (C₁₆H₂₈O, M=236 g/mol), Vanillin, Benzoin resinoid',
      volatilityNote: 'Phân tử diterpene và tricyclic ether có độ nhớt cao, áp suất hơi cực thấp, neo giữ các phân tử hương hoa.',
      observedLabNote: 'Mùi nhựa thơm ấm áp, ngọt dịu, tạo lớp nền dày dặn và sang trọng ở cuối pha bay hơi.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Kiểm soát theo hàm lượng Benzyl benzoate và nhựa Cistus ladaniferus (≤ 10.0% trong sản phẩm hoàn chỉnh).',
    },
    {
      id: 'base_vanilla',
      name: 'Vanilla 🍦 (Vani Bourbon)',
      scientificName: 'Vanilla planifolia',
      scentFamily: 'Gourmand Ngọt Dịu (Gourmand)',
      tier: 'base',
      description: 'Ngọt dịu, ấm áp và mềm mại, lưu giữ cảm xúc dễ chịu ở tầng hương cuối.',
      color: '#F59E0B',
      ifraMaxPercent: 6.0,
      chemicalCompounds: 'Vanillin (4-hydroxy-3-methoxybenzaldehyde, C₈H₈O₃, M=152 g/mol), p-Hydroxybenzaldehyde',
      volatilityNote: 'Mặc dù M=152 g/mol nhưng có cả nhóm -OH phenol và -CHO tạo liên kết hydro nội/liên phân tử rất bền nên bay hơi rất chậm.',
      observedLabNote: 'Vanilla 🍦 (15% hỗn hợp hương | 3% thành phẩm | 0,30 mL / 10mL): Vị ngọt kem dịu nhẹ, kết hợp cùng Xạ hương trắng giúp định hương tròn trịa sau 24h–72h ủ mẫu.',
      ifraTechnicalReference: 'IFRA Technical Reference: An toàn trên da ở mức ≤ 6.0% thành phẩm; lưu ý tính biến màu nhẹ khi tiếp xúc ánh sáng.',
    },
    {
      id: 'base_vetiver',
      name: 'Cỏ Hương Bài Haiti (Vetiver)',
      scientificName: 'Chrysopogon zizanioides',
      scentFamily: 'Khói & Rễ Cây (Smoky Earthy)',
      tier: 'base',
      description: 'Đậm đà hương khói, rễ cây xanh ngát đọng sương, đẳng cấp và trường tồn.',
      color: '#4D7C0F',
      ifraMaxPercent: 10.0,
      chemicalCompounds: 'Khusimol (C₁₅H₂₄O), α-Vetivone, β-Vetivone (sesquiterpene ketone, M=218 g/mol)',
      volatilityNote: 'Độ bay hơi thấp, rễ cây chưng cất chứa nhiều sesquiterpene nặng giúp định hương tự nhiên rất tốt.',
      observedLabNote: 'Mùi rễ cây xanh trầm, hơi khói khô mát, cân bằng tuyệt vời với các nốt cam chanh tươi mát.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Vetiver oil (khử hoặc nguyên bản) có giới hạn an toàn cao (≤ 10.0% thành phẩm).',
    },
    {
      id: 'base_musk',
      name: 'Xạ hương trắng 🤍 (White Musk)',
      scientificName: 'Macrocyclic Musk Accord',
      scentFamily: 'Xạ Hương Trong Trẻo (Clean Musk)',
      tier: 'base',
      description: 'Sạch sẽ, nhẹ nhàng và trong trẻo như làn sương mai, ôm sát làn da.',
      color: '#CBD5E1',
      ifraMaxPercent: 12.0,
      chemicalCompounds: 'Galaxolide / Habanolide / Ethylene brassylate (vòng macrocyclic C₁₅–C₁₇, M=250–270 g/mol)',
      volatilityNote: 'Khối lượng phân tử rất lớn (M ≈ 258 g/mol), áp suất hơi cực thấp; bao bọc và giữ các phân tử tầng đầu/giữa bay hơi đều đặn.',
      observedLabNote: 'Xạ hương trắng 🤍 (15% hỗn hợp hương | 3% thành phẩm | 0,30 mL / 10mL): Mùi hương sạch sẽ, mềm mại, giữ cho tổng thể Floris trong trẻo suốt nhiều giờ.',
      ifraTechnicalReference: 'IFRA 51st Amendment (Cat. 4): Sử dụng nhóm Macrocyclic Musk tổng hợp an toàn sinh học, giới hạn an toàn ≤ 12.0% thành phẩm.',
    },
  ],
};

/**
 * DỮ LIỆU ĐẦY ĐỦ BÁO CÁO THỰC HÀNH LÀM NƯỚC HOA CỦA NHÓM (∼✿∼THỰC HÀNH LÀM NƯỚC HOA∼✿∼)
 */
export const GROUP_LAB_REPORT_DATA = {
  headerTitle: '∼✿∼ THỰC HÀNH LÀM NƯỚC HOA ∼✿∼',
  topic: 'Mùa Xuân',
  productName: 'Floris',
  emotionalDirection: 'Tươi mới, nhẹ nhàng và trong trẻo 🫧',
  slogan: 'Chạm hương xuân, lưu nét dịu dàng',
  overallConcept: 'Một mùa xuân dịu dàng được lưu giữ trong hương thơm.',
  olfactoryPyramidSummary: {
    top: 'Hoa nhài 🌼',
    heart: 'Đào 🍑',
    base: 'Xạ hương trắng 🤍 + Vanilla 🍦',
  },
  formulaTable10ml: [
    { name: 'Hoa nhài 🌼', tier: 'Hương đầu', blendPct: 40, finalProductPct: 2.5, volume10ml: '0,25 mL', drops10ml: '5 giọt' },
    { name: 'Đào 🍑', tier: 'Hương giữa', blendPct: 30, finalProductPct: 2.0, volume10ml: '0,20 mL', drops10ml: '4 giọt' },
    { name: 'Xạ hương trắng 🤍', tier: 'Hương cuối', blendPct: 15, finalProductPct: 3.0, volume10ml: '0,30 mL', drops10ml: '6 giọt' },
    { name: 'Vanilla 🍦', tier: 'Hương cuối', blendPct: 15, finalProductPct: 2.5, volume10ml: '0,25 mL', drops10ml: '5 giọt' },
  ],
  summaryRows10ml: [
    { label: 'Tổng hỗn hợp hương (Cốt hương)', blendPct: '100%', finalProductPct: '10%', volume10ml: '1,00 mL', drops10ml: '20 giọt' },
    { label: 'Dung môi nước hoa (Ethanol 90% 8,00 mL + Nước cất 1,00 mL)', blendPct: '-', finalProductPct: '90%', volume10ml: '9,00 mL', drops10ml: '180 giọt' },
    { label: 'Tổng thành phẩm', blendPct: '-', finalProductPct: '100%', volume10ml: '10,00 mL', drops10ml: '200 giọt' },
  ],
  solventSurvey: {
    title: 'Độ tan và sự hòa trộn các thành phần',
    subtitle: 'Khảo sát giới hạn dung môi & cơ chế hòa tan',
    description: 'Nghiên cứu vai trò ethanol 90%, nước cất, tinh dầu và nguyên nhân nước hoa bị đục, phân lớp.',
    limitSurvey: {
      title: 'Khảo sát giới hạn dung môi',
      steps: [
        'Cố định hàm lượng tinh dầu: 1,00 mL tinh dầu (20 giọt).',
        'Cho từ từ ethanol 90% khi hòa tan hết tinh dầu: 8,00 mL ethanol (160 giọt).',
        'Thêm từ từ nước cất từng giọt đến khi dung dịch bị vẩn đục.',
      ],
      result: 'Theo khảo sát thực tế giới hạn để dung dịch không bị vẩn đục là 19–20 giọt ứng với khoảng 1,00 mL nước cất.',
      conclusion: 'Dung môi chiếm 90% thể tích toàn phần với ethanol chiếm 80% (8,00 mL = 160 giọt) và nước cất chiếm 10% (1,00 mL = 20 giọt).',
    },
    roles: [
      {
        name: 'Ethanol 90% (cồn)',
        role: 'Dung môi chính, giúp hòa tan hoàn toàn tinh dầu kỵ nước và hỗ trợ khuếch tán hương thơm ra không gian.',
      },
      {
        name: 'Nước cất tinh khiết',
        role: 'Điều chỉnh nồng độ dung môi, giúp giảm lượng ethanol trong công thức; dùng quá nhiều (>20 giọt) sẽ làm nước hoa bị đục hoặc tách lớp.',
      },
      {
        name: 'Tinh dầu / Hương liệu',
        role: 'Thành phần tạo mùi hương đặc trưng, quyết định hồn cốt và cảm xúc của nước hoa.',
      },
    ],
    causesOfCloudinessAndLayering: {
      cloudiness: 'Bị đục: Do tinh dầu không tan hoàn toàn, nước cất quá nhiều vượt ngưỡng bão hòa (> 20 giọt) hoặc một số thành phần kết tinh khi nhiệt độ thay đổi.',
      layering: 'Bị phân lớp: Do tinh dầu và dung môi không tương thích hoặc độ cồn không đủ cao để hòa tan lượng tinh dầu kỵ nước, khiến hỗn hợp tách thành các lớp riêng biệt.',
    },
    remedies: [
      'Sử dụng ethanol phù hợp (Ethanol 90%) và tinh dầu có nguồn gốc rõ ràng.',
      'Điều chỉnh tỉ lệ ethanol, nước cất và tinh dầu hợp lý (tỉ lệ chuẩn: 80% ethanol, 10% nước cất, 10% tinh dầu).',
      'Hòa tan tinh dầu trong ethanol trước, sau đó thêm nước cất từ từ từng giọt.',
      'Để hỗn hợp ổn định (maceration) 24h–72h và kiểm tra độ trong trước khi sử dụng.',
    ],
  },
  threeExperimentalVariants: [
    {
      id: 'sample_a_original',
      code: 'Mẫu A - Gốc',
      subtitle: 'Cân bằng dịu nhẹ (10% cốt hương)',
      totalFinishedPct: 10,
      totalVolumeMl: '1,00 mL cốt hương (20 giọt) + 9,00 mL dung môi (180 giọt)',
      imageUrl: import.meta.env.BASE_URL + 'assets/aistudio/7b513f70.png',
      items: [
        { name: 'Hoa nhài 🌼', finishedPct: 1.0, blendPct: 10, ml10: '0,10 mL', drops: '2 giọt' },
        { name: 'Đào 🍑', finishedPct: 2.0, blendPct: 20, ml10: '0,20 mL', drops: '4 giọt' },
        { name: 'Xạ hương trắng 🤍', finishedPct: 2.5, blendPct: 25, ml10: '0,25 mL', drops: '5 giọt' },
        { name: 'Vanilla 🍦', finishedPct: 4.5, blendPct: 45, ml10: '0,45 mL', drops: '9 giọt' },
      ],
      solventDetail: 'Ethanol 90%: 8,00 mL (160 giọt) + Nước cất: 1,00 mL (20 giọt) = 9,00 mL (180 giọt)',
    },
    {
      id: 'sample_b_fresher',
      code: 'Mẫu B - Tươi hơn',
      subtitle: 'Tăng hương đầu Hoa nhài (20% cốt hương)',
      totalFinishedPct: 20,
      totalVolumeMl: '2,00 mL cốt hương (40 giọt) + 8,00 mL dung môi (160 giọt)',
      imageUrl: import.meta.env.BASE_URL + 'assets/aistudio/758aa176.png',
      items: [
        { name: 'Hoa nhài 🌼', finishedPct: 6.0, blendPct: 30, ml10: '0,60 mL', drops: '12 giọt' },
        { name: 'Đào 🍑', finishedPct: 4.0, blendPct: 20, ml10: '0,40 mL', drops: '8 giọt' },
        { name: 'Xạ hương trắng 🤍', finishedPct: 5.0, blendPct: 25, ml10: '0,50 mL', drops: '10 giọt' },
        { name: 'Vanilla 🍦', finishedPct: 5.0, blendPct: 25, ml10: '0,50 mL', drops: '10 giọt' },
      ],
      solventDetail: 'Ethanol 90%: 7,20 mL (144 giọt) + Nước cất: 0,80 mL (16 giọt) = 8,00 mL (160 giọt)',
    },
    {
      id: 'sample_c_sweeter',
      code: 'Mẫu C - Dịu/Ngọt hơn',
      subtitle: 'Tăng hương cuối Xạ hương & Vanilla (20% cốt hương)',
      totalFinishedPct: 20,
      totalVolumeMl: '2,00 mL cốt hương (40 giọt) + 8,00 mL dung môi (160 giọt)',
      imageUrl: import.meta.env.BASE_URL + 'assets/aistudio/83106fcd.png',
      items: [
        { name: 'Hoa nhài 🌼', finishedPct: 4.0, blendPct: 20, ml10: '0,40 mL', drops: '8 giọt' },
        { name: 'Đào 🍑', finishedPct: 4.0, blendPct: 20, ml10: '0,40 mL', drops: '8 giọt' },
        { name: 'Xạ hương trắng 🤍', finishedPct: 6.0, blendPct: 30, ml10: '0,60 mL', drops: '12 giọt' },
        { name: 'Vanilla 🍦', finishedPct: 6.0, blendPct: 30, ml10: '0,60 mL', drops: '12 giọt' },
      ],
      solventDetail: 'Ethanol 90%: 7,20 mL (144 giọt) + Nước cất: 0,80 mL (16 giọt) = 8,00 mL (160 giọt)',
    },
  ],
  materialsAndTools: [
    'Ethanol 90%',
    'Nước cất tinh khiết',
    'Hương liệu/tinh dầu hoa nhài, đào, xạ hương trắng, vanilla',
    'Chai, lọ thuỷ tinh sạch, khô, có nắp kín (pha và ủ mẫu)',
    'Chai nước hoa (chứa sản phẩm cuối)',
    'Cốc/ống đong',
    'Pipet, que khuấy',
    'Phễu nhỏ (chiết sản phẩm)',
    'Nhãn và bút (ghi tên mẫu, ngày pha và công thức)',
    'Găng tay, kính bảo hộ',
  ],
  procedureSteps: [
    '1. Làm sạch và khử trùng dụng cụ, chuẩn bị đầy đủ nguyên liệu.',
    '2. Đong tinh dầu: Nhài: 0,10 mL (2 giọt); Đào: 0,20 mL (4 giọt); Xạ hương trắng: 0,25 mL (5 giọt); Vanilla: 0,45 mL (9 giọt). Tổng tinh dầu: 0,45 + 0,25 + 0,20 + 0,10 = 1,00 mL (20 giọt).',
    '3. Cho lần lượt các hương liệu vào một lọ thủy tinh sạch, khuấy nhẹ để các thành phần phân tán đồng đều.',
    '4. Pha dung môi (hỗn hợp ethanol 90% và nước cất): Ethanol: 8,00 mL (160 giọt) + Nước cất: 1,00 mL (20 giọt) => Tổng dung môi: 8,00 + 1,00 = 9,00 mL (180 giọt).',
    '5. Sau khi có 1,00 mL hỗn hợp hương, thêm 9,00 mL dung môi đã pha để tạo thành 10,00 mL nước hoa (200 giọt), tiếp tục khuấy nhẹ đảm bảo các thành phần hòa tan và phân bố đồng đều (tránh xa lửa và tia lửa).',
    '6. Đậy kín chai và để hỗn hợp ở nơi thoáng mát, tránh ánh nắng trực tiếp, nhiệt độ tương đối ổn định, tránh nguồn nhiệt.',
    '7. Theo dõi, ghi nhận kết quả của mẫu sau 24h, 48h, 72h.',
    '8. Kiểm tra màu sắc, độ trong và mùi hương; nếu cần có thể điều chỉnh nhẹ tỉ lệ hương liệu.',
    '9. Chiết hỗn hợp vào chai nước hoa sạch, đậy kín và dán nhãn.',
  ],
  safetyRules: [
    'Làm việc ở nơi thông thoáng, tránh hít trực tiếp hơi cồn và hương liệu.',
    'Đeo găng tay và kính bảo hộ khi pha chế để tránh tiếp xúc với mắt và da.',
    'Không để ethanol gần lửa, tia lửa hoặc nguồn nhiệt vì ethanol dễ cháy.',
    'Không nếm hoặc uống bất kỳ nguyên liệu hay sản phẩm nào.',
    'Đậy kín các chai nguyên liệu ngay sau khi sử dụng, bảo quản nơi mát và tránh ánh nắng trực tiếp.',
    'Đong nguyên liệu chính xác, không tự ý tăng nồng độ hương liệu.',
    'Kiểm tra SDS/IFRA của từng loại hương liệu trước khi sử dụng.',
    'Không xịt trực tiếp vào mắt, vết thương hoặc vùng da bị kích ứng.',
    'Thử trên một vùng da nhỏ trước khi sử dụng rộng rãi để phát hiện khả năng kích ứng.',
    'Nếu xảy ra tràn đổ, tránh xa nguồn lửa, thông gió khu vực, dùng vật liệu thấm hút để thu gom và xử lý đúng cách.',
    'Sau khi pha chế, vệ sinh dụng cụ và rửa tay sạch.',
    'Nếu xảy ra kích ứng mạnh hoặc tai nạn, ngừng sử dụng và báo ngay cho giáo viên/người phụ trách hoặc người lớn.',
  ],
  storageNote:
    'Đậy kín chai, để nơi khô mát, tránh ánh nắng trực tiếp và nguồn nhiệt; để xa tầm tay trẻ nhỏ.',
  spillResponseNote:
    'Tránh xa nguồn lửa; thông gió khu vực; không chạm trực tiếp bằng tay; dùng vật liệu thấm hút phù hợp để thu gom lượng chất lỏng, sau đó cho vào vật chứa phù hợp để xử lý. Không để sản phẩm chảy vào nguồn nước.',

  references: [
    {
      sourceNumber: 1,
      org: 'International Fragrance Association (IFRA)',
      author: 'International Fragrance Association (IFRA)',
      url: 'https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards',
      accessDate: '05/10/2026',
    },
    {
      sourceNumber: 2,
      org: 'Tisserand Institute',
      author: 'Robert Tisserand',
      url: 'https://tisserandinstitute.org/dilution-essential-oils/',
      accessDate: '07/10/2026',
    },
    {
      sourceNumber: 3,
      org: 'PubMed Central (PMC)',
      author: 'PubMed Central (PMC), U.S. National Library of Medicine',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8196857/',
      accessDate: '07/10/2026',
    },
  ],

  brandStoryAndConcept: {
    brandName: 'FLORIS',
    tagline: 'FLORIS - NƠI MÙA XUÂN CÒN LƯU LẠI',
    overallConcept: 'Một mùa xuân dịu dàng được lưu giữ trong hương thơm.',
    slogan: 'Chạm hương xuân, lưu nét dịu dàng',
    story:
      'Floris được lấy cảm hứng từ những khoảnh khắc đầu tiên của mùa xuân – khi cái lạnh dần nhường chỗ cho những tia nắng dịu dàng, cây cối bắt đầu đâm chồi và những cánh hoa đầu tiên nhẹ nhàng khoe sắc.\n\nTên “Floris” gợi liên tưởng đến flora – thế giới của hoa cỏ và thiên nhiên. Đó cũng là tinh thần mà thương hiệu muốn gửi gắm: mỗi người đều có một “mùa xuân” của riêng mình – một khoảng thời gian tươi đẹp, trong trẻo và đáng được lưu giữ.\n\nHành trình của Floris bắt đầu với hoa nhài, tươi sáng, thanh mát như một buổi sáng đầu xuân, mở ra những điều mới mẻ đang chờ đợi phía trước. Khi hương thơm lan tỏa, hương đào tựa khu vườn đang nở rộ, mềm mại và tinh khôi, gợi lên vẻ đẹp tự nhiên cùng những cảm xúc dịu dàng của tuổi trẻ. Cuối cùng, xạ hương trắng và vanilla lưu lại trên làn da một dư âm êm dịu, như ký ức về mùa xuân còn ở lại – nhẹ nhàng, ấm áp và khó quên.\n\nFloris không chỉ tạo ra một mùi hương, mà muốn biến mỗi lần xịt nước hoa thành một khoảnh khắc mở ra mùa xuân của riêng mình – nơi sự tươi mới được đánh thức, vẻ đẹp được lưu giữ và những cảm xúc trong trẻo có thể ở lại lâu hơn.',
    targetUser: {
      demographic: 'Học sinh, sinh viên nữ độ tuổi từ 16-25.',
      personality: 'Dịu dàng, tinh tế, yêu thiên nhiên, thích sự trong trẻo và nữ tính.',
      preference: 'Những mùi hương nhẹ, không quá nồng, phù hợp sử dụng hằng ngày.',
      needs: 'Muốn tạo cảm giác tươi mới, dễ chịu và tự nhiên.',
    },
    usageContext: {
      timeOfDay: 'Ban ngày, đặc biệt là buổi sáng hoặc chiều.',
      location: 'Đi học, đi làm, đi cà phê, đi dạo hoặc gặp gỡ bạn bè.',
      occasions: 'Những buổi gặp mặt, đi chơi, hẹn hò nhẹ nhàng hoặc các hoạt động thường ngày.',
      style: 'Phù hợp với người yêu thích sự tươi mới, nhẹ nhàng, trong trẻo và nữ tính.',
      season: 'Đặc biệt phù hợp với mùa xuân và mùa hè nhờ hương nhài, đào tạo cảm giác thanh mát.',
    },
    threeKeyAdjectives: [
      {
        word: 'Tươi mới',
        explanation: 'Hoa nhài mở đầu bằng sắc hoa nhẹ nhàng, thanh thoát.',
      },
      {
        word: 'Trong trẻo',
        explanation: 'Đào tạo nên nét hoa ngọt dịu, tươi tắn và mềm mại.',
      },
      {
        word: 'Dịu dàng',
        explanation: 'Xạ hương trắng và vanilla khép lại bằng nét ấm áp, êm dịu và lưu luyến.',
      },
    ],
  },

  ingredientSelectionReasons: [
    {
      tier: 'Hương đầu',
      ingredients: 'Hoa nhài 🌼',
      bulletPoints: [
        'Hương hoa thanh thoát, mềm mại, có nét ngọt dịu.',
        'Tạo cảm giác nhẹ nhàng, tinh tế và mở đầu cho hành trình hương thơm.',
      ],
      conclusion: 'Hương nhài tinh khôi mở đầu cho hành trình hương thơm mùa xuân thanh khiết.',
    },
    {
      tier: 'Hương giữa',
      ingredients: 'Đào 🍑',
      bulletPoints: [
        'Hương trái cây ngọt dịu, mọng nước, tươi tắn.',
        'Mang lại nét trẻ trung, rạng rỡ, gợi liên tưởng đến sự tươi mới của mùa xuân.',
      ],
      conclusion: 'Hương đào tạo nét chuyển biến tươi vui, mềm mại và căng tràn sức sống.',
    },
    {
      tier: 'Hương cuối',
      ingredients: 'Xạ hương trắng 🤍 + Vanilla 🍦',
      bulletPoints: [
        'Xạ hương trắng: Hương mềm mại, sạch sẽ, êm dịu.',
        'Vanilla: Hương ngọt ấm, dịu nhẹ.',
      ],
      conclusion: 'Hai nguyên liệu tạo một lớp nền êm, ấm và lưu luyến, cân bằng với sự tươi sáng của hai tầng hương phía trên.',
    },
  ],

  schoolVsIndustryTable: [
    {
      criterion: 'Quy mô',
      school: 'Nhỏ, vài chục mL hoặc theo yêu cầu bài học',
      industry: 'Lớn, từ quy mô phòng thí nghiệm đến sản xuất hàng loạt với số lượng lớn',
    },
    {
      criterion: 'Nguyên liệu',
      school: 'Nguyên có giá thành rẻ và dễ dàng mua, nguồn gốc rõ ràng. Sử dụng cồn phù hợp, hương liệu dùng cho mỹ phẩm và dụng cụ đơn giản',
      industry: 'Nhiều nguyên liệu tự nhiên và tổng hợp, được kiểm tra trước khi sử dụng theo tiêu chuẩn chất lượng, có nguồn gốc, thông số kỹ thuật và đánh giá an toàn',
    },
    {
      criterion: 'Định lượng',
      school: 'Đo bằng dụng cụ thí nghiệm, thực hiện thủ công, công thức đơn giản',
      industry: 'Hệ thống định lượng và phối trộn có độ chính xác cao, có thể tự động hoá, có công thức được chuẩn hóa đảm bảo tính đồng nhất',
    },
    {
      criterion: 'Ủ/ổn định',
      school: 'Thực hiện theo thời gian và điều kiện giáo viên hướng dẫn. Đựng trong chai kín, để nơi mát, tránh ánh sáng trực tiếp và theo dõi sự thay đổi của mùi hương. Thời gian tùy công thức',
      industry: 'Có quy trình và điều kiện được kiểm soát theo tiêu chuẩn sản xuất. Thực hiện theo thời gian và điều kiện đã được xác lập, có kiểm soát nhiệt độ, thời gian và các thông số cần thiết',
    },
    {
      criterion: 'Lọc',
      school: 'Chỉ thực hiện khi dung dịch có cặn hoặc chưa đồng nhất. Dùng giấy lọc hoặc dụng cụ lọc phù hợp nếu hỗn hợp có cặn',
      industry: 'Thực hiện theo yêu cầu kỹ thuật của từng công thức. Sử dụng hệ thống lọc phù hợp, yêu cầu chất lượng, kiểm soát độ trong và nguy cơ nhiễm bẩn',
    },
    {
      criterion: 'Kiểm tra',
      school: 'Chủ yếu đánh giá cảm quan và hình thức sản phẩm. Kiểm tra bằng quan sát và đánh giá cảm quan: mùi hương, màu sắc, độ trong và hiện tượng tách lớp',
      industry: 'Có hệ thống kiểm soát chất lượng gồm: cảm quan, tính chất hóa lý, độ ổn định, vi sinh khi phù hợp và đánh giá an toàn sản phẩm hồ sơ lô sản xuất và các phép kiểm tra chuyên môn',
    },
    {
      criterion: 'Đóng chai',
      school: 'Chiết thủ công vào chai nhỏ, đóng nắp kín và thành phần, ngày thực hiện, dán nhãn sản phẩm theo thiết kế tự do',
      industry: 'Đóng gói theo dây chuyền chiết rót, đóng nắp, kiểm soát bao bì, độ kín và thông tin nhãn',
    },
    {
      criterion: 'Mục đích',
      school: 'Học tập, minh họa nguyên tắc pha chế và tạo sản phẩm, tìm hiểu cách phối trộn nguyên liệu, rèn luyện kỹ năng thực hành',
      industry: 'Đưa sản phẩm ra thị trường, phải đáp ứng yêu cầu an toàn và pháp lý, nhu cầu người tiêu dùng và tuân thủ quy định về chất lượng',
    },
  ],

  scentTierRoles: [
    {
      tier: 'Đầu',
      role: 'Tạo ấn tượng ban đầu, giúp mùi hương trở nên tươi sáng và thu hút',
      evaporationRate: 'Nhanh',
      perceptionTime: 'Ngay khi xịt, thường cảm nhận rõ trong khoảng vài phút đầu',
      ingredients: 'Hoa nhài 🌼',
    },
    {
      tier: 'Giữa',
      role: 'Tạo chủ đề chính và tính cách đặc trưng của nước hoa',
      evaporationRate: 'Trung bình',
      perceptionTime: 'Xuất hiện sau khi hương đầu dịu xuống, kéo dài vài giờ',
      ingredients: 'Đào 🍑',
    },
    {
      tier: 'Cuối',
      role: 'Tạo chiều sâu, độ ấm và giúp lưu giữ tổng thể mùi hương',
      evaporationRate: 'Chậm',
      perceptionTime: 'Cảm nhận rõ hơn về sau và lưu lại lâu nhất',
      ingredients: 'Xạ hương trắng 🤍 + Vanilla 🍦',
    },
  ],

  conceptAndPyramidDetails: [
    {
      id: 'concept_main',
      badge: 'Ý TƯỞNG CHỦ ĐẠO',
      title: 'Sản Phẩm Floris — Chủ Đề Mùa Xuân',
      subtitle: 'Định hướng cảm xúc: Tươi mới, nhẹ nhàng và trong trẻo 🫧',
      summary: '4 nguyên liệu • 1,00 mL cốt hương (10% = 20 giọt) + 9,00 mL dung môi (90% = 180 giọt) = 10,00 mL (200 giọt)',
      specificContent: [
        'Chủ đề & Cảm hứng: Lấy cảm hứng từ những khoảnh khắc đầu tiên của Mùa Xuân khi nắng ấm dần lan tỏa, cây cối đâm chồi và hoa bung sắc. "Floris" mang ý nghĩa thế giới hoa cỏ và thiên nhiên, lưu giữ mùa xuân dịu dàng trong từng làn hương.',
        'Cấu trúc hợp hương chuẩn: Phối hợp 3 tầng hương hài hòa: Hương đầu Hoa nhài 🌼 (40% cốt hương | 2,5% thành phẩm = 0,25 mL / 5 giọt); Hương giữa Đào 🍑 (30% cốt hương | 2,0% thành phẩm = 0,20 mL / 4 giọt); Hương cuối Xạ hương trắng 🤍 (15% cốt hương | 3,0% thành phẩm = 0,30 mL / 6 giọt) + Vanilla 🍦 (15% cốt hương | 2,5% thành phẩm = 0,25 mL / 5 giọt).',
        'Cơ sở Hóa học & Khảo sát dung môi: Dung môi chiếm 90% thể tích toàn phần gồm Ethanol 90% (8,00 mL = 160 giọt) hòa tan hoàn toàn tinh dầu, kết hợp nước cất tinh khiết (1,00 mL = 20 giọt - đạt đúng ngưỡng bão hòa 19–20 giọt khảo sát thực tế để dung dịch trong suốt, không bị đục hay phân lớp).',
      ],
    },
    {
      id: 'pyramid_top',
      badge: 'HƯƠNG ĐẦU (TOP NOTES)',
      title: 'Hoa nhài 🌼 (Jasmine Top Note)',
      subtitle: '40% Hỗn hợp hương • 2,5% Thành phẩm • 0,25 mL / 10 mL (5 giọt)',
      summary: 'Hoa nhài (40% HH = 2,5% TP = 0,25 mL = 5 giọt)',
      specificContent: [
        'Định lượng chi tiết: Gồm 0,25 mL hương Hoa nhài 🌼 (5 giọt chuẩn, tương ứng 40% trong hỗn hợp cốt hương và 2,5% trong nước hoa thành phẩm).',
        'Cơ sở Hóa học & Độ bay hơi: Chứa các ester thơm nhẹ như Benzyl acetate (C₉H₁₀O₂, M = 150 g/mol) và monoterpene alcohol Linalool. Áp suất hơi cao và lực tương tác liên phân tử yếu giúp các phân tử hương nhài thoát nhanh khỏi bề mặt cồn ngay khi xịt.',
        'Cảm quan thực nghiệm (0 – 20 phút đầu): Mở đầu bằng sắc hoa thanh thoát, mềm mại, có nét ngọt dịu tinh tế, xua tan mùi cồn ban đầu và mở lối cho hành trình hương xuân.',
      ],
    },
    {
      id: 'pyramid_heart',
      badge: 'HƯƠNG GIỮA (HEART NOTES)',
      title: 'Đào 🍑 (Peach Accord)',
      subtitle: '30% Hỗn hợp hương • 2,0% Thành phẩm • 0,20 mL / 10 mL (4 giọt)',
      summary: 'Đào (30% HH = 2,0% TP = 0,20 mL = 4 giọt)',
      specificContent: [
        'Định lượng chi tiết: Gồm 0,20 mL hương Đào 🍑 (4 giọt chuẩn, tương ứng 30% trong hỗn hợp cốt hương và 2,0% trong nước hoa thành phẩm).',
        'Cơ sở Hóa học & Độ bay hơi: Chứa các lactone mạch vòng đặc trưng như gamma-Undecalactone (C₁₁H₂₀O₂, aldehyde đào C14). Khối lượng phân tử trung bình giúp lactone bay hơi ở tốc độ ổn định từ phút 20 đến giờ thứ 3.',
        'Cảm quan thực nghiệm (20 phút – 3 giờ): Hương trái cây ngọt dịu, mọng nước và tươi tắn, mang lại nét trẻ trung, rạng rỡ và nữ tính, đóng vai trò trái tim định hình tính cách mùa xuân của Floris.',
      ],
    },
    {
      id: 'pyramid_base',
      badge: 'HƯƠNG CUỐI (BASE NOTES)',
      title: 'Xạ hương trắng 🤍 + Vanilla 🍦',
      subtitle: '30% Hỗn hợp hương • 5,5% Thành phẩm • 0,55 mL / 10 mL (11 giọt)',
      summary: 'Xạ hương trắng (15% HH = 3,0% TP = 0,30 mL = 6 giọt) + Vanilla (15% HH = 2,5% TP = 0,25 mL = 5 giọt)',
      specificContent: [
        'Định lượng chi tiết: Gồm 0,30 mL Xạ hương trắng 🤍 (6 giọt | 15% HH | 3,0% TP) và 0,25 mL Vanilla 🍦 (5 giọt | 15% HH | 2,5% TP). Tổng thể tích tầng cuối là 0,55 mL (11 giọt) trên 10,00 mL nước hoa.',
        'Cơ sở Hóa học & Định hương (Fixative): Vòng đại phân tử Macrocyclic Musk (M ≈ 250–270 g/mol) và phân tử Vanillin (C₈H₈O₃ có cả nhóm -OH phenol và -CHO tạo liên kết hydro liên phân tử rất bền) có áp suất hơi cực thấp. Theo định luật Raoult, chúng ghìm giữ các phân tử hương đầu và giữa bay hơi từ tốn.',
        'Cảm quan thực nghiệm (Sau 2 – 6+ giờ & sau 24h–72h ủ): Xạ hương trắng mang lại cảm giác mềm mại, sạch sẽ như sương mai, kết hợp Vanilla ngọt ấm tạo lớp nền êm dịu, ấm áp và lưu luyến khó quên.',
      ],
    },
  ],

  formulaRowDetails: {
    'Hoa nhài 🌼': {
      scientificName: 'Jasminum sambac (Hợp hương Hoa Nhài)',
      tier: 'Hương đầu (Top Note)',
      blendPct: '40%',
      finalProductPct: '2,5%',
      volume10ml: '0,25 mL (5 giọt)',
      chemicalCompounds: 'Benzyl acetate (C₉H₁₀O₂, M = 150 g/mol), Linalool (C₁₀H₁₈O), Cis-Jasmone.',
      volatilityAndMechanism: 'Ester Benzyl acetate có áp suất hơi cao, lực hút liên phân tử yếu, khuếch tán nhanh trong 15–20 phút đầu tạo ấn tượng mở màn.',
      observedInLab: 'Hương hoa thanh thoát, mềm mại, ngọt dịu; mở đầu nhẹ nhàng, tinh tế và trong trẻo ngay khi xịt.',
      safetyAndIfra: 'Đạt chuẩn IFRA 51st Amendment (Cat. 4): An toàn trên da ở mức ≤ 4,0% trong thành phẩm nước hoa (mức dùng trong Floris là 2,5%).',
    },
    'Đào 🍑': {
      scientificName: 'Prunus persica Accord (Hợp hương Đào)',
      tier: 'Hương giữa (Heart Note)',
      blendPct: '30%',
      finalProductPct: '2,0%',
      volume10ml: '0,20 mL (4 giọt)',
      chemicalCompounds: 'gamma-Undecalactone (C₁₁H₂₀O₂, aldehyde đào C14), Hexyl acetate, Linalool.',
      volatilityAndMechanism: 'Lactone mạch vòng bay hơi ở tốc độ trung bình, duy trì hương đào ngọt dịu suốt 2–4 giờ ở tầng giữa.',
      observedInLab: 'Hương trái cây ngọt dịu, mọng nước, tươi tắn; mang lại nét trẻ trung, rạng rỡ của mùa xuân.',
      safetyAndIfra: 'Đạt chuẩn IFRA 51st Amendment (Cat. 4): Các lactone hương đào đạt chuẩn an toàn cao trên da (≤ 8,0% thành phẩm; mức dùng thực tế 2,0%).',
    },
    'Xạ hương trắng 🤍': {
      scientificName: 'Macrocyclic Musk Accord (Xạ Hương Trắng)',
      tier: 'Hương cuối (Base Note / Chất định hương)',
      blendPct: '15%',
      finalProductPct: '3,0%',
      volume10ml: '0,30 mL (6 giọt)',
      chemicalCompounds: 'Ethylene brassylate / Habanolide / Galaxolide (vòng lớn C₁₅–C₁₇, M ≈ 250–270 g/mol).',
      volatilityAndMechanism: 'Khối lượng phân tử lớn và áp suất hơi cực thấp. Tạo màng phân tử giữ các hợp chất dễ bay hơi ở tầng đầu và tầng giữa thoát ra từ từ.',
      observedInLab: 'Hương mềm mại, sạch sẽ, êm dịu; giúp nước hoa bám lâu trên da và tạo độ mượt rõ rệt sau 24h–72h ủ mẫu.',
      safetyAndIfra: 'Sử dụng nhóm Macrocyclic Musk tổng hợp an toàn sinh học, dễ phân hủy sinh học, giới hạn IFRA Category 4 lên tới 12,0% thành phẩm.',
    },
    'Vanilla 🍦': {
      scientificName: 'Vanilla planifolia (Hương Vani Bourbon)',
      tier: 'Hương cuối (Base Note / Chất định hương)',
      blendPct: '15%',
      finalProductPct: '2,5%',
      volume10ml: '0,25 mL (5 giọt)',
      chemicalCompounds: 'Vanillin (4-hydroxy-3-methoxybenzaldehyde, C₈H₈O₃, M = 152 g/mol), p-Hydroxybenzaldehyde.',
      volatilityAndMechanism: 'Có đồng thời nhóm -OH phenol và -CHO aldehyde tạo liên kết hydro liên phân tử rất bền, làm giảm mạnh tốc độ bay hơi.',
      observedInLab: 'Hương ngọt ấm, dịu nhẹ; kết hợp cùng Xạ hương trắng tạo lớp nền êm, ấm và lưu luyến, cân bằng với sự tươi sáng của tầng trên.',
      safetyAndIfra: 'An toàn trên da theo IFRA (≤ 6,0% thành phẩm). Lưu ý bảo quản nơi khô mát, tránh ánh nắng trực tiếp.',
    },
    'Tổng hỗn hợp hương (Cốt hương)': {
      scientificName: 'Fragrance Concentrate / Perfume Oil Blend (4 thành phần)',
      tier: 'Toàn bộ 3 tầng hương (Đầu 40% : Giữa 30% : Cuối 30%)',
      blendPct: '100%',
      finalProductPct: '10%',
      volume10ml: '1,00 mL (20 giọt)',
      chemicalCompounds: 'Hỗn hợp đồng nhất của Benzyl acetate, gamma-Undecalactone, Macrocyclic Musk và Vanillin.',
      volatilityAndMechanism: 'Tạo hệ dung dịch lý tưởng đa cấu tử; khi hòa tan 4 hương liệu với nhau trước khi thêm cồn giúp hình thành liên kết Van der Waals và liên kết hydro đồng nhất.',
      observedInLab: 'Tổng thể tích 4 hương liệu đong được đúng 1,00 mL (20 giọt: 5 giọt Nhài + 4 giọt Đào + 6 giọt Xạ hương trắng + 5 giọt Vanilla).',
      safetyAndIfra: 'Tuân thủ đúng nồng độ thiết kế 10% cốt hương để đảm bảo độ hòa tan trong dung môi và an toàn trên da.',
    },
    'Dung môi nước hoa (Ethanol 90% 8,00 mL + Nước cất 1,00 mL)': {
      scientificName: 'Hydroalcoholic Solvent (Ethanol 90% + Aqua Destillata)',
      tier: 'Dung môi dẫn truyền & Hòa tan (Solvent / Carrier)',
      blendPct: '-',
      finalProductPct: '90%',
      volume10ml: '9,00 mL (180 giọt)',
      chemicalCompounds: 'Ethanol 90% (8,00 mL = 160 giọt) + Nước cất tinh khiết (1,00 mL = 20 giọt).',
      volatilityAndMechanism: 'Ethanol có đầu không phân cực (-C₂H₅) hòa tan tinh dầu kỵ nước và đầu phân cực (-OH) hòa tan nước cất. Nước cất thêm vào đúng ngưỡng 19–20 giọt giúp làm dịu nồng độ cồn mà không làm dung dịch bị đục hay phân lớp.',
      observedInLab: 'Khi hòa tan 1,00 mL tinh dầu trong 8,00 mL ethanol 90% rồi nhỏ từ từ 1,00 mL (20 giọt) nước cất, dung dịch đạt độ trong suốt hoàn toàn.',
      safetyAndIfra: 'Cảnh báo an toàn: Ethanol 90% rất dễ cháy. Tuyệt đối tránh xa lửa, tia lửa và nguồn nhiệt trong suốt quá trình đong và khuấy.',
    },
    'Tổng thành phẩm': {
      scientificName: 'Nước hoa hoàn chỉnh Floris (Finished Perfume)',
      tier: 'Sản phẩm hoàn chỉnh (10% cốt hương • 10,00 mL • 200 giọt)',
      blendPct: '-',
      finalProductPct: '100%',
      volume10ml: '10,00 mL (200 giọt)',
      chemicalCompounds: 'Hệ dung dịch đồng thể gồm 10% cốt hương liệu và 90% dung môi Ethanol 90% + Nước cất.',
      volatilityAndMechanism: 'Sau khi pha chế và ủ (maceration) qua các mốc 24h, 48h, 72h ở nơi khô mát, mạng lưới liên kết hydro đạt trạng thái cân bằng, làm dịu mùi cồn gắt và giúp 3 tầng hương chuyển tiếp mượt mà.',
      observedInLab: 'Sau 24h, 48h và 72h theo dõi: dung dịch giữ độ trong suốt ổn định, mùi hương tròn trịa, tươi mới, nhẹ nhàng và trong trẻo đúng mục tiêu thiết kế.',
      safetyAndIfra: 'Bảo quản trong chai thủy tinh kín, tránh ánh nắng trực tiếp; thử trên vùng da nhỏ ở cổ tay trước khi sử dụng rộng rãi.',
    },
  } as Record<
    string,
    {
      scientificName: string;
      tier: string;
      blendPct: string;
      finalProductPct: string;
      volume10ml: string;
      chemicalCompounds: string;
      volatilityAndMechanism: string;
      observedInLab: string;
      safetyAndIfra: string;
    }
  >,

  variantDetails: {
    sample_a_original: {
      title: 'Mẫu A - Gốc (Cân Bằng Dịu Nhẹ)',
      ratioSummary: 'Nhài 1% (2 giọt) • Đào 2% (4 giọt) • Xạ hương trắng 2,5% (5 giọt) • Vanilla 4,5% (9 giọt) • Tổng 10% cốt hương (1,00 mL = 20 giọt) + 9,00 mL dung môi (180 giọt)',
      purpose: 'Mẫu chuẩn cơ sở (Baseline) thể hiện trọn vẹn định hướng "tươi mới, nhẹ nhàng và trong trẻo 🫧", êm dịu, không gắt cồn.',
      comparisonWithBase: 'Nồng độ cốt hương 10% (1,00 mL = 20 giọt), dung môi 90% (Ethanol 90% 8,00 mL/160 giọt + Nước cất 1,00 mL/20 giọt).',
      chemistryExplanation: 'Tầng cuối (Xạ hương trắng 2,5% + Vanilla 4,5% = 7% thành phẩm, chiếm 70% cốt hương) tạo khung định hương vững chắc, kết hợp Đào 2% (20% HH) và Nhài 1% (10% HH) giúp mùi hương dịu dàng, mềm mại.',
      evaluation24to72h: 'Sau 24h–72h ủ mẫu: Dung dịch trong suốt, không bị đục hay phân lớp; mùi cồn dịu hẳn, hương hoa nhài và đào lên tự nhiên, hậu vị vani - xạ hương ấm êm.',
    },
    sample_b_fresher: {
      title: 'Mẫu B - Tươi hơn (Tăng Hương Đầu Hoa Nhài)',
      ratioSummary: 'Nhài 6% (12 giọt) • Đào 4% (8 giọt) • Xạ hương trắng 5% (10 giọt) • Vanilla 5% (10 giọt) • Tổng 20% cốt hương (2,00 mL = 40 giọt) + 8,00 mL dung môi (160 giọt)',
      purpose: 'Khảo sát ảnh hưởng khi tăng gấp đôi nồng độ cốt hương lên 20% và ưu tiên nốt Hoa nhài để mùi hương tươi sáng, rực rỡ hơn.',
      comparisonWithBase: 'So với Mẫu A: Tăng tổng cốt hương từ 10% lên 20% (1,00 mL → 2,00 mL); tăng Hoa nhài từ 1% lên 6% (0,10 → 0,60 mL = 12 giọt); tăng Đào lên 4% (0,40 mL = 8 giọt). Dung môi giảm từ 9,00 mL về 8,00 mL.',
      chemistryExplanation: 'Hàm lượng Benzyl acetate và Linalool ở tầng đầu tăng vọt giúp áp suất hơi ban đầu lớn, lan tỏa hương hoa trắng tươi mát ngay khi xịt.',
      evaluation24to72h: 'Sau 24h–72h ủ mẫu: Độ tỏa hương (sillage) mạnh và bừng sáng hơn rõ rệt ngay từ 15 phút đầu; mùi hương tươi tắn và sắc nét.',
    },
    sample_c_sweeter: {
      title: 'Mẫu C - Dịu/Ngọt hơn (Tăng Hương Cuối Xạ Hương & Vanilla)',
      ratioSummary: 'Nhài 4% (8 giọt) • Đào 4% (8 giọt) • Xạ hương trắng 6% (12 giọt) • Vanilla 6% (12 giọt) • Tổng 20% cốt hương (2,00 mL = 40 giọt) + 8,00 mL dung môi (160 giọt)',
      purpose: 'Khảo sát vai trò định hương và tạo độ ngọt ấm của Xạ hương trắng và Vanilla ở nồng độ cốt hương 20%.',
      comparisonWithBase: 'So với Mẫu A: Tăng tổng cốt hương lên 20% (2,00 mL = 40 giọt); tăng Xạ hương trắng lên 6% (0,60 mL = 12 giọt) và Vanilla lên 6% (0,60 mL = 12 giọt).',
      chemistryExplanation: 'Tăng nồng độ vòng macrocyclic musk và Vanillin làm tăng liên kết hydro và tương tác Van der Waals, ghìm giữ các phân tử hương đầu và giữa thoát ra chậm hơn, giúp mùi hương ngọt dịu và lưu hương lâu nhất.',
      evaluation24to72h: 'Sau 24h–72h ủ mẫu: Mùi hương đằm thắm, ngọt ấm, độ bám tỏa trên giấy thử sau 6 giờ vượt trội so với Mẫu A và Mẫu B.',
    },
  } as Record<
    string,
    {
      title: string;
      ratioSummary: string;
      purpose: string;
      comparisonWithBase: string;
      chemistryExplanation: string;
      evaluation24to72h: string;
    }
  >,

  materialsAndToolsDetails: [
    {
      title: 'Ethanol 90%',
      role: 'Dung môi hòa tan chính và dẫn truyền hương liệu (8,00 mL / 10 mL = 160 giọt, chiếm 80% thể tích).',
      technicalDetail: 'Sử dụng cồn mỹ phẩm/y tế tinh khiết 90% (C₂H₅OH) không tạp chất mùi lạ. Hòa tan hoàn toàn tinh dầu kỵ nước và thao tác tuyệt đối xa nguồn lửa.',
    },
    {
      title: 'Nước cất tinh khiết',
      role: 'Dung môi điều chỉnh nồng độ, làm giảm độ gắt của cồn (1,00 mL / 10 mL = 20 giọt, chiếm 10% thể tích).',
      technicalDetail: 'Nhỏ từ từ từng giọt vào hỗn hợp cồn-tinh dầu; theo khảo sát thực tế giới hạn không bị vẩn đục là 19–20 giọt (~1,00 mL).',
    },
    {
      title: 'Hương liệu/tinh dầu hoa nhài, đào, xạ hương trắng, vanilla',
      role: '4 thành phần tạo nên 3 tầng hương mùa xuân của nước hoa Floris.',
      technicalDetail: 'Đậy kín nắp từng lọ ngay sau khi hút bằng pipet để tránh bay hơi; đong chính xác từng giọt (1 giọt = 0,05 mL).',
    },
    {
      title: 'Chai, lọ thuỷ tinh sạch, khô, có nắp kín (pha và ủ mẫu)',
      role: 'Bình chứa trung gian để phối trộn cốt hương với dung môi và ủ mẫu trong 24h – 72h.',
      technicalDetail: 'Bắt buộc dùng thủy tinh trơ hóa học, không dùng lọ nhựa vì cồn và tinh dầu có thể hòa tan chất hóa dẻo trong nhựa làm hỏng mùi.',
    },
    {
      title: 'Chai nước hoa (chứa sản phẩm cuối)',
      role: 'Chai xịt thành phẩm 10,00 mL dùng để bảo quản và thử mùi sau khi hoàn tất quá trình ủ.',
      technicalDetail: 'Chọn chai thủy tinh có vòi xịt phun sương mịn (atomizer) và nắp đậy kín.',
    },
    {
      title: 'Cốc/ống đong',
      role: 'Dụng cụ đo lường thể tích dung môi Ethanol 90% (8,00 mL) và kiểm tra tổng thể tích (10,00 mL).',
      technicalDetail: 'Đặt ống đong trên mặt bàn phẳng và đọc vạch chia ở ngang tầm mắt (đáy mặt khum chất lỏng).',
    },
    {
      title: 'Pipet, que khuấy',
      role: 'Pipet dùng để đong chính xác từng lượng nhỏ hương liệu và đếm giọt (1 giọt = 0,05 mL); que khuấy thủy tinh giúp phân tán đồng đều.',
      technicalDetail: 'Sử dụng riêng từng pipet cho mỗi loại hương liệu để không làm nhiễm chéo mùi giữa các lọ nguyên liệu gốc.',
    },
    {
      title: 'Phễu nhỏ (chiết sản phẩm)',
      role: 'Hỗ trợ rót hỗn hợp nước hoa từ lọ ủ sang chai nước hoa thành phẩm 10,00 mL.',
      technicalDetail: 'Giúp chiết chất lỏng gọn gàng qua cổ chai hẹp, tránh rơi vãi hỗn hợp cồn – hương liệu.',
    },
    {
      title: 'Nhãn và bút (ghi tên mẫu, ngày pha và công thức)',
      role: 'Đánh dấu rõ ràng từng mẫu thực nghiệm (Mẫu A - Gốc, Mẫu B - Tươi hơn, Mẫu C - Dịu/Ngọt hơn).',
      technicalDetail: 'Ghi đầy đủ: Tên sản phẩm (Floris), Mã mẫu, Tỉ lệ từng chất, Ngày giờ bắt đầu pha để theo dõi ở các mốc 24h, 48h, 72h.',
    },
    {
      title: 'Găng tay, kính bảo hộ',
      role: 'Trang bị bảo hộ cá nhân (PPE) bảo vệ da tay và mắt trong suốt buổi thực hành.',
      technicalDetail: 'Ngăn tinh dầu nguyên chất và Ethanol 90% bắn vào mắt hoặc tiếp xúc trực tiếp với da gây kích ứng.',
    },
  ],

  procedureStepDetails: [
    {
      stepNumber: 1,
      title: 'Chuẩn bị & Khử trùng dụng cụ',
      content: 'Làm sạch và khử trùng dụng cụ, chuẩn bị đầy đủ nguyên liệu.',
      specificDetail: 'Tráng sạch lọ thủy tinh, ống đong, que khuấy và phễu bằng một lượng nhỏ cồn rồi để khô hoàn toàn. Tránh nước lã còn đọng làm ảnh hưởng độ trong của dung dịch.',
    },
    {
      stepNumber: 2,
      title: 'Đong 4 thành phần hương liệu (Tổng 1,00 mL = 20 giọt)',
      content: 'Đong: Nhài: 0,10 mL (2 giọt); Đào: 0,20 mL (4 giọt); Xạ hương trắng: 0,25 mL (5 giọt); Vanilla: 0,45 mL (9 giọt). Tổng: 0,45 + 0,25 + 0,20 + 0,10 = 1,00 mL (20 giọt).',
      specificDetail: 'Dùng pipet chuẩn quy đổi 1 giọt = 0,05 mL đong chính xác từng thành phần theo đúng công thức Mẫu A (hoặc 40 giọt khi pha Mẫu B và Mẫu C).',
    },
    {
      stepNumber: 3,
      title: 'Phối trộn đồng đều hỗn hợp cốt hương',
      content: 'Cho lần lượt các hương liệu vào một lọ thủy tinh sạch, khuấy nhẹ để các thành phần phân tán đồng đều.',
      specificDetail: 'Cho các tinh dầu/hương liệu hòa tan vào nhau trước để các phân tử tầng cuối (Xạ hương trắng, Vanilla) liên kết sớm với nốt Đào và Nhài.',
    },
    {
      stepNumber: 4,
      title: 'Pha dung môi nước hoa (Tổng 9,00 mL = 180 giọt)',
      content: 'Pha dung môi (hỗn hợp ethanol 90% và nước cất): Ethanol: 8,00 mL (160 giọt); Nước cất: 1,00 mL (20 giọt). Tổng dung môi: 8,00 + 1,00 = 9,00 mL (180 giọt).',
      specificDetail: 'Đong 8,00 mL ethanol 90% vào cốc đong, sau đó dùng pipet thêm 1,00 mL nước cất tinh khiết (20 giọt) và khuấy đều.',
    },
    {
      stepNumber: 5,
      title: 'Phối trộn hương với dung môi (Tổng 10,00 mL = 200 giọt)',
      content: 'Sau khi có 1,00 mL hỗn hợp hương, thêm: 9,00 mL dung môi đã pha để tạo thành 10,00 mL nước hoa (200 giọt), tiếp tục khuấy nhẹ đảm bảo các thành phần hòa tan và phân bố đồng đều (tránh xa lửa và tia lửa).',
      specificDetail: 'Rót từ từ 9,00 mL dung môi đã pha vào 1,00 mL hỗn hợp hương, dùng đũa thủy tinh khuấy nhẹ nhàng. Kiểm tra dung dịch đạt độ trong suốt hoàn toàn.',
    },
    {
      stepNumber: 6,
      title: 'Đậy kín & Để hỗn hợp ổn định (Ủ mẫu)',
      content: 'Đậy kín chai và để hỗn hợp ở nơi: thoáng mát, tránh ánh nắng trực tiếp, nhiệt độ tương đối ổn định, tránh nguồn nhiệt.',
      specificDetail: 'Quá trình ủ mẫu giúp mạng lưới liên kết hydro giữa ethanol và các phân tử hương ổn định, làm dịu mùi cồn gắt ban đầu.',
    },
    {
      stepNumber: 7,
      title: 'Theo dõi & Ghi nhận kết quả mẫu',
      content: 'Theo dõi, ghi nhận kết quả của mẫu sau 24h, 48h, 72h.',
      specificDetail: 'Ở mỗi mốc 24h, 48h và 72h: Quan sát trạng thái vật lý (màu sắc, độ trong suốt) và thử mùi trên que giấy thử (blotter) theo 3 giai đoạn (mới xịt, sau 30 phút, sau 2–4 giờ).',
    },
    {
      stepNumber: 8,
      title: 'Kiểm tra cảm quan & Điều chỉnh nhẹ',
      content: 'Kiểm tra màu sắc, độ trong và mùi hương; nếu cần có thể điều chỉnh nhẹ tỉ lệ hương liệu.',
      specificDetail: 'Đánh giá độ trong suốt, khả năng tách lớp và độ êm của mùi hương sau 72h. Nếu muốn tươi mát hơn định hướng theo Mẫu B, hoặc ngọt ấm theo Mẫu C.',
    },
    {
      stepNumber: 9,
      title: 'Chiết thành phẩm & Dán nhãn hoàn thiện',
      content: 'Chiết hỗn hợp vào chai nước hoa sạch, đậy kín và dán nhãn.',
      specificDetail: 'Dùng phễu nhỏ chiết dung dịch nước hoa đã ổn định vào chai xịt 10,00 mL, đậy kín nắp và dán nhãn ghi rõ: Tên sản phẩm (Floris), Mã mẫu, Ngày pha và Tỉ lệ thành phần.',
    },
  ],

  safetyRuleDetails: [
    {
      ruleNumber: 1,
      rule: 'Làm việc ở nơi thông thoáng, tránh hít trực tiếp hơi cồn và hương liệu.',
      specificDetail: 'Hơi Ethanol 90% và các hợp chất dễ bay hơi ở nồng độ đậm đặc có thể gây kích ứng niêm mạc mũi nếu hít trực tiếp ở cự ly gần. Luôn dùng que giấy thử (blotter) cách mũi 10–15 cm và phẩy nhẹ.',
    },
    {
      ruleNumber: 2,
      rule: 'Đeo găng tay và kính bảo hộ khi pha chế để tránh tiếp xúc với mắt và da.',
      specificDetail: 'Tinh dầu nguyên chất chưa pha loãng chứa nồng độ cao các hợp chất hữu cơ hoạt tính có thể gây rát mắt hoặc viêm da tiếp xúc nếu dính trực tiếp.',
    },
    {
      ruleNumber: 3,
      rule: 'Không để ethanol gần lửa, tia lửa hoặc nguồn nhiệt vì ethanol dễ cháy.',
      specificDetail: 'Ethanol 90% có điểm chớp cháy thấp, hơi cồn nặng hơn không khí và dễ bắt lửa từ đèn cồn, công tắc điện hoặc nguồn nhiệt trong phòng thí nghiệm.',
    },
    {
      ruleNumber: 4,
      rule: 'Không nếm hoặc uống bất kỳ nguyên liệu hay sản phẩm nào.',
      specificDetail: 'Cồn pha chế và các hợp chất hương liệu chỉ dùng ngoài da, tuyệt đối không được nếm hoặc nuốt.',
    },
    {
      ruleNumber: 5,
      rule: 'Đậy kín các chai nguyên liệu ngay sau khi sử dụng, bảo quản nơi mát và tránh ánh nắng trực tiếp.',
      specificDetail: 'Ngăn chặn sự bay hơi làm sai lệch nồng độ và hạn chế oxy không khí + tia UV oxy hóa các hợp chất thơm.',
    },
    {
      ruleNumber: 6,
      rule: 'Đong nguyên liệu chính xác, không tự ý tăng nồng độ hương liệu.',
      specificDetail: 'Tuân thủ đúng tổng 1,00 mL hương liệu / 10,00 mL thành phẩm (10% ở Mẫu A). Tự ý tăng nồng độ vượt giới hạn vừa làm lệch cấu trúc mùi vừa có nguy cơ vượt ngưỡng an toàn da liễu IFRA.',
    },
    {
      ruleNumber: 7,
      rule: 'Kiểm tra SDS/IFRA của từng loại hương liệu trước khi sử dụng.',
      specificDetail: 'Kiểm tra kỹ phiếu an toàn hóa chất (SDS) và tiêu chuẩn IFRA Category 4 của từng lô tinh dầu trước khi pha chế.',
    },
    {
      ruleNumber: 8,
      rule: 'Không xịt trực tiếp vào mắt, vết thương hoặc vùng da bị kích ứng.',
      specificDetail: 'Dung môi cồn và tinh dầu sẽ gây xót mạnh và tổn thương mô nếu tiếp xúc với niêm mạc mắt hoặc vết thương hở.',
    },
    {
      ruleNumber: 9,
      rule: 'Thử trên một vùng da nhỏ trước khi sử dụng rộng rãi để phát hiện khả năng kích ứng.',
      specificDetail: 'Thực hiện Patch Test (xịt/chấm lượng nhỏ lên mặt trong cổ tay và theo dõi 15–30 phút) để kiểm tra cơ địa người dùng có mẫn cảm không.',
    },
    {
      ruleNumber: 10,
      rule: 'Nếu xảy ra tràn đổ, tránh xa nguồn lửa, thông gió khu vực, dùng vật liệu thấm hút để thu gom và xử lý đúng cách.',
      specificDetail: 'Tắt ngay mọi nguồn nhiệt xung quanh, mở cửa thông thoáng để phân tán hơi cồn, dùng khăn giấy/vật liệu thấm hút chuyên dụng thu gom vào túi kín.',
    },
    {
      ruleNumber: 11,
      rule: 'Sau khi pha chế, vệ sinh dụng cụ và rửa tay sạch.',
      specificDetail: 'Rửa sạch ống đong, lọ thủy tinh, que khuấy và rửa tay bằng xà phòng để loại bỏ hoàn toàn vết hương liệu bám trên da.',
    },
    {
      ruleNumber: 12,
      rule: 'Nếu xảy ra kích ứng mạnh hoặc tai nạn, ngừng sử dụng và báo ngay cho giáo viên/người phụ trách hoặc người lớn.',
      specificDetail: 'Rửa vùng da/mắt bị dính hóa chất dưới vòi nước sạch chảy liên tục trong ít nhất 10–15 phút và báo ngay cho giáo viên hướng dẫn để xử lý y tế kịp thời.',
    },
  ],

  storageDetail: {
    title: 'BẢO QUẢN SẢN PHẨM NƯỚC HOA FLORIS',
    summary: 'Đậy kín chai, để nơi khô mát, tránh ánh nắng trực tiếp và nguồn nhiệt; để xa tầm tay trẻ nhỏ.',
    specificPoints: [
      'Nhiệt độ lý tưởng: Bảo quản ở nhiệt độ phòng ổn định (18–25°C), tránh để gần cửa sổ nắng chiếu trực tiếp hoặc cốp xe nóng.',
      'Cơ chế bảo vệ Hóa học: Tránh tia UV và nhiệt độ cao giúp ngăn ngừa phản ứng thủy phân ester (trong Hoa nhài) và phản ứng oxy hóa hợp chất thơm (trong Đào, Vanilla).',
      'Đậy kín nắp sau mỗi lần xịt để hạn chế không khí lọt vào chai và giữ nguyên nồng độ Ethanol 90%.',
    ],
  },

  spillResponseDetail: {
    title: 'QUY TRÌNH XỬ LÝ KHI TRÀN ĐỔ TRONG PHÒNG THÍ NGHIỆM',
    summary: 'Tránh xa nguồn lửa; thông gió khu vực; không chạm trực tiếp bằng tay; dùng vật liệu thấm hút phù hợp để thu gom lượng chất lỏng, sau đó cho vào vật chứa phù hợp để xử lý. Không để sản phẩm chảy vào nguồn nước.',
    specificPoints: [
      'Bước 1 (Cách ly nguồn nhiệt): Lập tức kiểm tra và tắt mọi nguồn lửa/nhiệt gần khu vực tràn đổ vì hỗn hợp chứa Ethanol 90% dễ bay hơi và bắt cháy.',
      'Bước 2 (Thông gió & Bảo hộ): Mở cửa sổ thông gió, đeo găng tay bảo hộ (tuyệt đối không dùng tay trần lau tinh dầu đậm đặc).',
      'Bước 3 (Thu gom & Xử lý môi trường): Dùng giấy thấm hoặc vật liệu thấm hút thu gom toàn bộ chất lỏng vào vật chứa chất thải hữu cơ có nắp kín. Tuyệt đối không xả trực tiếp tinh dầu chưa xử lý xuống bồn rửa/nguồn nước.',
    ],
  },
};

/**
 * CÔNG THỨC NƯỚC HOA THỰC NGHIỆM GỐC CỦA NHÓM (Hiển thị ngay khi mở ứng dụng trước cả hướng dẫn)
 */
export const EXPERIMENTAL_BASELINE_FORMULA: ExperimentalBaselineFormula = {
  title: 'Floris — Chủ Đề Mùa Xuân (Mẫu A - Gốc)',
  batchCode: 'THỰC HÀNH LÀM NƯỚC HOA • 10,00 mL (10% Cốt hương : 90% Dung môi Ethanol 90% & Nước cất)',
  authors: 'Nhóm Thực Nghiệm Floris - Mùa Xuân',
  season: 'spring',
  totalVolume: 10,
  concentrationName: 'Cốt hương Thực Nghiệm (10%)',
  concentrationPercent: 10,
  slots: {
    top1: {
      id: 'top_jasmine',
      percentage: 40,
      observedNote:
        'Hoa nhài 🌼 (40% cốt hương | 2,5% thành phẩm | 0,25 mL / 10mL = 5 giọt): Hương hoa thanh thoát, mềm mại, có nét ngọt dịu mở đầu cho hành trình hương thơm mùa xuân.',
    },
    top2: {
      id: 'top_jasmine_fresh',
      percentage: 0,
      observedNote:
        'Hoa nhài Trắng 🌼: Tạo nét tươi mới, thanh thoát, phù hợp với chủ đề Mùa Xuân.',
    },
    heart1: {
      id: 'heart_peach',
      percentage: 30,
      observedNote:
        'Đào 🍑 (30% cốt hương | 2,0% thành phẩm | 0,20 mL / 10mL = 4 giọt): Hương trái cây ngọt dịu, mọng nước, tươi tắn, mang lại nét trẻ trung, rạng rỡ của mùa xuân.',
    },
    heart2: {
      id: 'heart_peach_ripe',
      percentage: 0,
      observedNote:
        'Đào Mùa Xuân 🍑: Nét hoa quả ngọt dịu, tươi tắn và mềm mại.',
    },
    base1: {
      id: 'base_musk',
      percentage: 15,
      observedNote:
        'Xạ hương trắng 🤍 (15% cốt hương | 3,0% thành phẩm | 0,30 mL / 10mL = 6 giọt): Hương mềm mại, sạch sẽ, êm dịu tạo lớp nền lưu hương bền lâu.',
    },
    base2: {
      id: 'base_vanilla',
      percentage: 15,
      observedNote:
        'Vanilla 🍦 (15% cốt hương | 2,5% thành phẩm | 0,25 mL / 10mL = 5 giọt): Hương ngọt ấm, dịu nhẹ giúp định hương và ổn định mùi sau 24h, 48h, 72h ủ mẫu.',
    },
  },
  initialEvaluation: {
    physicalState:
      'Dung dịch sau khi pha 1,00 mL hỗn hợp hương với 9,00 mL dung môi (Ethanol 90% 8,00 mL + Nước cất 1,00 mL) đạt tổng 10,00 mL thành phẩm, theo dõi sau 24h, 48h, 72h đạt độ trong suốt hoàn hảo, không bị đục hay phân lớp.',
    scentEvolution:
      'Định hướng cảm xúc: Tươi mới, nhẹ nhàng và trong trẻo 🫧. Hương đầu mở ra với Hoa nhài 🌼 (2,5% TP = 5 giọt) thanh thoát; chuyển sang Hương giữa Đào 🍑 (2% TP = 4 giọt) mọng nước; lắng đọng ở Hương cuối Xạ hương trắng 🤍 (3% TP = 6 giọt) + Vanilla 🍦 (2,5% TP = 5 giọt) êm dịu.',
    strengths:
      'Tỉ lệ phối hợp hài hòa giữa hoa nhài, đào, xạ hương trắng và vanilla. Nhóm đã khảo sát thực tế giới hạn dung môi 19–20 giọt nước cất và pha chế đối chứng thành công 3 mẫu: Mẫu A (Gốc 10%), Mẫu B (Tươi hơn 20%) và Mẫu C (Dịu/Ngọt hơn 20%).',
    pointsToImprove:
      'Người tham quan tại buổi triển lãm có thể điều chỉnh tỉ lệ theo sở thích (tươi sáng hơn như Mẫu B, ngọt ấm lưu hương hơn như Mẫu C) và đối chiếu trực tiếp cơ sở Hóa học.',
    panelScore: 'Mẫu A (Gốc) • 10,00 mL (1,00 mL hương liệu = 20 giọt + 9,00 mL dung môi = 180 giọt)',
  },
};

export const SEASONAL_TEMPLATES: Record<'spring' | 'summer' | 'autumn' | 'winter', SeasonalTemplate> = {
  spring: {
    season: 'spring',
    title: 'Mùa Xuân (Spring)',
    subtitle: 'Floris • Tươi Mới, Nhẹ Nhàng & Trong Trẻo 🫧',
    description: 'Chủ đề thực hành Mùa Xuân của nhóm Floris: Hoa nhài mở đầu thanh thoát, Đào ở tầng giữa mọng nước và Xạ hương trắng + Vanilla lắng đọng êm dịu.',
    recommendedTiers: { top: 40, heart: 30, base: 30 },
    defaultFormula: {
      top1: { id: 'top_jasmine', percentage: 40 },
      top2: { id: 'top_jasmine_fresh', percentage: 0 },
      heart1: { id: 'heart_peach', percentage: 30 },
      heart2: { id: 'heart_peach_ripe', percentage: 0 },
      base1: { id: 'base_musk', percentage: 15 },
      base2: { id: 'base_vanilla', percentage: 15 },
    },
  },
  summer: {
    season: 'summer',
    title: 'Mùa Hè (Summer)',
    subtitle: 'Tươi Mát, Đại Dương & Nắng Vàng',
    description: 'Nắng gắt và oi bức. Tầng đầu cần nhẹ nhàng bay bổng với cam chanh mọng nước và bạc hà giải nhiệt.',
    recommendedTiers: { top: 40, heart: 40, base: 20 },
    defaultFormula: {
      top1: { id: 'top_lemon', percentage: 20 },
      top2: { id: 'top_peppermint', percentage: 20 },
      heart1: { id: 'heart_lavender', percentage: 25 },
      heart2: { id: 'heart_jasmine', percentage: 15 },
      base1: { id: 'base_cedarwood', percentage: 12 },
      base2: { id: 'base_vetiver', percentage: 8 },
    },
  },
  autumn: {
    season: 'autumn',
    title: 'Mùa Thu (Autumn)',
    subtitle: 'Lá Vàng, Gió Heo May & Hoài Niệm',
    description: 'Không khí se lạnh và khô ráo. Thích hợp cho các nốt hoa nồng ấm, gỗ dịu dàng và chút ngọt ngào mật ong.',
    recommendedTiers: { top: 25, heart: 45, base: 30 },
    defaultFormula: {
      top1: { id: 'top_mandarin', percentage: 15 },
      top2: { id: 'top_cardamom', percentage: 10 },
      heart1: { id: 'heart_iris', percentage: 25 },
      heart2: { id: 'heart_ylang', percentage: 20 },
      base1: { id: 'base_patchouli', percentage: 18 },
      base2: { id: 'base_amber', percentage: 12 },
    },
  },
  winter: {
    season: 'winter',
    title: 'Mùa Đông (Winter)',
    subtitle: 'Ấm Áp, Gỗ Nồng & Hổ Phách Sang Trọng',
    description: 'Nhiệt độ thấp làm phân tử hương bay hơi chậm. Cần nồng độ tầng đáy cao, nhiều gỗ, nhựa thơm và vani ấm cúng.',
    recommendedTiers: { top: 20, heart: 45, base: 35 },
    defaultFormula: {
      top1: { id: 'top_orange', percentage: 10 },
      top2: { id: 'top_pinkpepper', percentage: 10 },
      heart1: { id: 'heart_cinnamon', percentage: 20 },
      heart2: { id: 'heart_rose', percentage: 25 },
      base1: { id: 'base_amber', percentage: 20 },
      base2: { id: 'base_vanilla', percentage: 15 },
    },
  },
};
