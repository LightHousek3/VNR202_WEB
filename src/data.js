export const textbook = {
  file: 'Giao-trinh-Lich-su-Dang-Cong-san-Viet-Nam-2021.pdf',
  textFile: 'Giao-trinh-Lich-su-Dang-Cong-san-Viet-Nam-2021.txt',
  printedTitle: 'Giáo trình Lịch sử Đảng Cộng sản Việt Nam',
  publicationNote: 'Bản giáo trình năm 2021 theo thông tin xuất bản đã hiệu chỉnh.',
  chapter: 'Chương 3 · Đảng lãnh đạo cả nước quá độ lên chủ nghĩa xã hội và tiến hành công cuộc đổi mới (1975–2018)',
};

const source = (id, page, excerpt, note = '') => ({
  id,
  file: textbook.file,
  chapter: 'Chương 3',
  printedPage: page,
  excerpt,
  note,
  sourceType: 'giao trinh',
});

const discussionChoice = (id, title, detail, alignment = 'alternative') => ({ id, title, detail, alignment, sourceType: 'mo phong' });

export const dossiers = [
  {
    id: 'context',
    number: '01',
    title: 'Bối cảnh và nhận thức mới sau gần 15 năm đổi mới',
    shortTitle: 'Bối cảnh đổi mới',
    icon: 'Compass',
    theme: 'blue',
    pattern: 'horizon',
    summary: {
      text: 'Giáo trình đặt Đại hội IX vào bối cảnh đầu thế kỷ XXI: khoa học – công nghệ, kinh tế tri thức và toàn cầu hóa phát triển mạnh. Sau 15 năm đổi mới, đất nước có thành tựu quan trọng nhưng kinh tế chưa vững chắc, hiệu quả và sức cạnh tranh còn thấp; chỉ tiêu tăng trưởng 5 năm Đại hội VIII đề ra chưa đạt.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('steady', 'Tạm dừng đổi mới để giữ ổn định ngắn hạn', 'Đề xuất mô phỏng: ưu tiên ổn định trước và tạm hoãn chương trình đổi mới toàn diện.'),
      discussionChoice('accelerate', 'Chỉ tập trung vào tốc độ tăng trưởng', 'Đề xuất mô phỏng: lấy tăng trưởng nhanh làm trọng tâm, đặt các bài học đổi mới khác ở vị trí thứ yếu.'),
      discussionChoice('balance', 'Tiếp tục đổi mới theo các bài học đã xác định', 'Kiên trì độc lập dân tộc và chủ nghĩa xã hội; dựa vào nhân dân, gắn đổi mới với thực tiễn và kết hợp sức mạnh dân tộc với sức mạnh thời đại.', 'official'),
    ],
    congressDirection: {
      text: 'Đại hội tiếp tục đổi mới toàn diện, khẳng định các bài học đổi mới: kiên trì mục tiêu độc lập dân tộc và chủ nghĩa xã hội; dựa vào nhân dân; kết hợp sức mạnh dân tộc với sức mạnh thời đại; giữ vững đường lối đúng đắn.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Lựa chọn trong mô phỏng là của người học. Phần đối chiếu tóm lược các bài học và nhận thức được giáo trình ghi nhận; không phải kết quả bỏ phiếu của đại biểu.',
      sourceType: 'dien giai',
    },
    sources: [
      source('context-146', 146, 'Sau 15 năm đổi mới, Việt Nam đạt được nhiều thành tựu quan trọng, tạo thế và lực mới nhưng nền kinh tế phát triển chưa vững chắc, hiệu quả và sức cạnh tranh thấp.'),
      source('context-147', 147, 'Đổi mới phải dựa vào nhân dân, vì lợi ích của nhân dân, phù hợp với thực tiễn, luôn luôn sáng tạo.'),
    ],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu bối cảnh Đại hội IX và các bài học đổi mới tại trang 146–147.' },
  },
  {
    id: 'socialist-path',
    number: '02',
    title: 'Con đường đi lên chủ nghĩa xã hội',
    shortTitle: 'Con đường phát triển',
    icon: 'Route',
    theme: 'red',
    pattern: 'path',
    summary: {
      text: 'Giáo trình trình bày con đường quá độ lên chủ nghĩa xã hội là bỏ qua việc xác lập vị trí thống trị của quan hệ sản xuất và kiến trúc thượng tầng tư bản chủ nghĩa, đồng thời tiếp thu thành tựu nhân loại, nhất là khoa học và công nghệ.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('inherit', 'Xác lập chế độ tư bản chủ nghĩa trước', 'Đề xuất mô phỏng: coi việc xác lập chế độ tư bản chủ nghĩa là chặng bắt buộc.'),
      discussionChoice('stages', 'Bỏ qua cả thành tựu của chủ nghĩa tư bản', 'Đề xuất mô phỏng: không kế thừa thành tựu nhân loại về khoa học và công nghệ.'),
      discussionChoice('combine', 'Quá độ lên chủ nghĩa xã hội, kế thừa thành tựu nhân loại', 'Không xác lập sự thống trị của quan hệ sản xuất và kiến trúc thượng tầng tư bản chủ nghĩa; tiếp thu thành tựu, nhất là khoa học – công nghệ, qua thời kỳ quá độ lâu dài.', 'official'),
    ],
    congressDirection: {
      text: 'Đại hội IX tiếp tục khẳng định con đường quá độ lên chủ nghĩa xã hội, bỏ qua chế độ tư bản chủ nghĩa theo nghĩa không xác lập sự thống trị của quan hệ sản xuất và kiến trúc thượng tầng tư bản chủ nghĩa; kế thừa thành tựu nhân loại để phát triển đất nước.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Giáo trình giải thích rõ “bỏ qua” không đồng nghĩa với bỏ qua mọi thành tựu của nhân loại. Các phương án chỉ là lựa chọn thảo luận mô phỏng.',
      sourceType: 'dien giai',
    },
    sources: [source('path-147', 147, 'nhưng tiếp thu, kế thừa những thành tựu mà nhân loại đã đạt được dưới chế độ tư bản chủ nghĩa, đặc biệt về khoa học và công nghệ.')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu theo phần nhận thức mới về con đường xã hội chủ nghĩa tại Đại hội IX.' },
  },
  {
    id: 'market-economy',
    number: '03',
    title: 'Kinh tế thị trường định hướng xã hội chủ nghĩa',
    shortTitle: 'Mô hình kinh tế',
    icon: 'ChartNoAxesCombined',
    theme: 'gold',
    pattern: 'grid',
    summary: {
      text: 'Giáo trình nêu chủ trương thực hiện nhất quán, lâu dài kinh tế thị trường định hướng xã hội chủ nghĩa, xem đây là mô hình kinh tế tổng quát trong thời kỳ quá độ; nền kinh tế có nhiều hình thức sở hữu, thành phần kinh tế và hình thức phân phối.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('state-market', 'Kinh tế thị trường định hướng xã hội chủ nghĩa', 'Nền kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường, có Nhà nước quản lý; phân phối chủ yếu theo lao động và hiệu quả, đồng thời tính đến đóng góp nguồn lực và phúc lợi xã hội.', 'official'),
      discussionChoice('plural', 'Chỉ để thị trường tự điều tiết', 'Đề xuất mô phỏng: loại bỏ vai trò quản lý của Nhà nước đối với nền kinh tế.'),
      discussionChoice('distribution', 'Quay lại cơ chế bao cấp một thành phần', 'Đề xuất mô phỏng: thay nhiều thành phần và hình thức phân phối bằng một cơ chế tập trung duy nhất.'),
    ],
    congressDirection: {
      text: 'Mô hình được nêu là kinh tế hàng hóa nhiều thành phần vận động theo cơ chế thị trường, có Nhà nước quản lý theo định hướng xã hội chủ nghĩa; phân phối chủ yếu theo kết quả lao động và hiệu quả kinh tế, đồng thời tính đến các đóng góp khác và phúc lợi xã hội.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Hướng được giáo trình ghi nhận kết hợp cơ chế thị trường với quản lý nhà nước và định hướng xã hội chủ nghĩa. Không phương án mô phỏng nào đại diện cho lá phiếu thật.',
      sourceType: 'dien giai',
    },
    sources: [source('market-148', 148, 'Đảng, Nhà nước chủ trương thực hiện nhất quán và lâu dài nền kinh tế thị trường định hướng xã hội chủ nghĩa;')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Giáo trình trình bày nội dung này trực tiếp trong phần văn kiện Đại hội IX.' },
  },
  {
    id: 'strategy',
    number: '04',
    title: 'Chiến lược phát triển kinh tế – xã hội 2001–2010',
    shortTitle: 'Chiến lược 2001–2010',
    icon: 'Landmark',
    theme: 'blue',
    pattern: 'steps',
    summary: {
      text: 'Đại hội thông qua Chiến lược phát triển kinh tế – xã hội 2001–2010. Giáo trình nêu mục tiêu đưa nước ta ra khỏi tình trạng kém phát triển, tạo nền tảng để đến năm 2020 cơ bản trở thành nước công nghiệp theo hướng hiện đại; GDP năm 2010 gấp đôi năm 2000.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('foundation', 'Chỉ đặt mục tiêu tăng GDP', 'Đề xuất mô phỏng: đo thành công bằng sản lượng, không gắn với mục tiêu phát triển dài hạn đến năm 2020.'),
      discussionChoice('double-gdp', 'Ưu tiên tiêu dùng ngắn hạn', 'Đề xuất mô phỏng: dồn nguồn lực cho lợi ích trước mắt thay vì tạo nền tảng phát triển 10 năm.'),
      discussionChoice('capacity', 'Thực hiện mục tiêu Chiến lược 2001–2010', 'Đưa đất nước ra khỏi tình trạng kém phát triển, tạo nền tảng để đến năm 2020 cơ bản trở thành nước công nghiệp theo hướng hiện đại; GDP năm 2010 gấp đôi năm 2000.', 'official'),
    ],
    congressDirection: {
      text: 'Đại hội IX thông qua Chiến lược 2001–2010 với mục tiêu tổng quát nêu trên; giáo trình còn ghi mục tiêu tiếp tục đưa GDP năm 2010 lên gấp đôi năm 2000.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Đối chiếu theo mục tiêu Chiến lược 2001–2010 được giáo trình nêu tại trang 146–147. Tờ trình tập trung vào văn kiện và mục tiêu 10 năm mà Đại hội IX thông qua.',
      sourceType: 'dien giai',
    },
    sources: [source('strategy-146', 146, 'Đại hội đã thông qua các văn kiện chính trị quan trọng, trong đó có Chiến lược phát triển kinh tế-xã hội 2001-2010;'), source('strategy-goal-146', 146, 'Đại hội đã đề ra Chiến lược phát triển kinh tế-xã hội 10 năm tiếp theo (2001- 2010) với mục tiêu tổng quát là đưa nước ta ra khỏi tình trạng kém phát triển, tạo nền tảng để đến năm 2020 nước ta cơ bản trở thành một nước công nghiệp theo hướng hiện đại;'), source('strategy-gdp-147', 147, 'tiếp tục đưa GDP năm 2010 lên gấp đôi so với năm 2000.')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu theo Chiến lược 2001–2010 tại trang 146–147.' },
  },
  {
    id: 'culture-society',
    number: '05',
    title: 'Văn hóa và các vấn đề xã hội',
    shortTitle: 'Văn hóa · xã hội',
    icon: 'LibraryBig',
    theme: 'red',
    pattern: 'arch',
    depth: 'Trạm thảo luận sâu',
    summary: {
      text: 'Giáo trình nêu xây dựng nền văn hóa Việt Nam tiên tiến, đậm đà bản sắc dân tộc; văn hóa vừa là nền tảng tinh thần, vừa là mục tiêu và động lực phát triển kinh tế – xã hội, góp phần xây dựng con người phát triển toàn diện.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('foundation', 'Để văn hóa sau mục tiêu kinh tế', 'Đề xuất mô phỏng: ưu tiên tăng trưởng trước, xem văn hóa là lĩnh vực phụ trợ.'),
      discussionChoice('human', 'Chỉ bảo tồn truyền thống, không đổi mới', 'Đề xuất mô phỏng: thu hẹp văn hóa vào bảo tồn, không đặt mục tiêu phát triển con người toàn diện.'),
      discussionChoice('together', 'Xây dựng nền văn hóa tiên tiến, đậm đà bản sắc dân tộc', 'Coi văn hóa là nền tảng tinh thần, đồng thời là mục tiêu và động lực phát triển kinh tế – xã hội; hướng tới con người phát triển toàn diện.', 'official'),
    ],
    congressDirection: {
      text: 'Hướng được sách ghi nhận là xây dựng nền văn hóa tiên tiến, đậm đà bản sắc dân tộc, góp phần phát triển con người toàn diện và thúc đẩy phát triển kinh tế – xã hội.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Đối chiếu phần văn kiện Đại hội IX về văn hóa tại trang 148. Lựa chọn theo hướng Đại hội IX nêu đầy đủ vị trí của văn hóa và mục tiêu phát triển con người được giáo trình ghi nhận.',
      sourceType: 'dien giai',
    },
    sources: [source('culture-148', 148, 'Xây dựng nền văn hóa Việt Nam tiên tiến, đậm đà bản sắc dân tộc là nền tảng tinh thần của xã hội, vừa là mục tiêu, vừa là động lực thúc đẩy sự phát triển kinh tế-xã hội;')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu định hướng văn hóa tại trang 148.' },
  },
  {
    id: 'foreign-relations',
    number: '06',
    title: 'Đối ngoại và hội nhập kinh tế quốc tế',
    shortTitle: 'Đối ngoại · hội nhập',
    icon: 'Globe2',
    theme: 'gold',
    pattern: 'orbit',
    summary: {
      text: 'Giáo trình nêu mở rộng quan hệ đối ngoại, chủ động hội nhập kinh tế quốc tế và thực hiện đường lối độc lập, tự chủ, rộng mở, đa phương hóa, đa dạng hóa các quan hệ quốc tế.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('independent', 'Thu hẹp quan hệ để tránh hội nhập', 'Đề xuất mô phỏng: hạn chế mở rộng quan hệ đối ngoại và hợp tác kinh tế quốc tế.'),
      discussionChoice('integrate', 'Hội nhập bằng mọi giá', 'Đề xuất mô phỏng: mở cửa nhanh mà không giữ yêu cầu độc lập, tự chủ và đa dạng hóa quan hệ.'),
      discussionChoice('diverse', 'Độc lập, tự chủ và chủ động hội nhập', 'Mở rộng quan hệ; đa phương hóa, đa dạng hóa; chủ động hội nhập kinh tế quốc tế và sẵn sàng là bạn, là đối tác tin cậy của các nước.', 'official'),
    ],
    congressDirection: {
      text: 'Đại hội IX nêu đường lối đối ngoại độc lập, tự chủ, rộng mở, đa phương hóa, đa dạng hóa; Việt Nam sẵn sàng là bạn và đối tác tin cậy của các nước.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Giáo trình đặt hội nhập kinh tế quốc tế cùng với tính độc lập, tự chủ và mở rộng quan hệ; đây là nội dung Đại hội IX, không phải phần triển khai 2002–2004.',
      sourceType: 'dien giai',
    },
    sources: [source('foreign-148', 148, 'Mở rộng quan hệ đối ngoại, chủ động hội nhập kinh tế quốc tế. Thực hiện nhất quán đường lối đối ngoại độc lập tự chủ, rộng mở, đa phương hoá, đa dạng hoá các quan hệ quốc tế.')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Định hướng đối ngoại được ghi trực tiếp trong phần văn kiện Đại hội IX.' },
  },
  {
    id: 'unity',
    number: '07',
    title: 'Đại đoàn kết, dân tộc, tôn giáo và người Việt Nam ở nước ngoài',
    shortTitle: 'Đại đoàn kết',
    icon: 'UsersRound',
    theme: 'blue',
    pattern: 'weave',
    summary: {
      text: 'Trong phần Đại hội IX, giáo trình xác định đại đoàn kết toàn dân trên nền tảng liên minh công nhân – nông dân – trí thức là động lực chủ yếu phát triển đất nước. Các nghị quyết chuyên đề về dân tộc, tôn giáo và người Việt Nam ở nước ngoài xuất hiện ở phần triển khai sau Đại hội IX.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('common-ground', 'Ưu tiên lợi ích riêng từng nhóm', 'Đề xuất mô phỏng: tổ chức chính sách theo lợi ích cục bộ thay vì lấy đại đoàn kết làm động lực chung.'),
      discussionChoice('coalition', 'Đại đoàn kết trên nền tảng liên minh công – nông – trí thức', 'Phát huy khối đại đoàn kết toàn dân do Đảng lãnh đạo làm động lực chủ yếu phát triển đất nước, kết hợp hài hòa các lợi ích.', 'official'),
      discussionChoice('inclusion', 'Tách các nhóm xã hội thành khối riêng', 'Đề xuất mô phỏng: không xây dựng nền tảng liên minh chung giữa công nhân, nông dân và trí thức.'),
    ],
    congressDirection: {
      text: 'Đại hội IX nêu đại đoàn kết toàn dân trên cơ sở liên minh công nhân, nông dân và trí thức do Đảng lãnh đạo là động lực chủ yếu phát triển đất nước. Chi tiết chính sách dân tộc, tôn giáo và cộng đồng ở nước ngoài được đối chiếu riêng ở mục triển khai sau Đại hội.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Không nhập các nghị quyết Trung ương 7 năm 2003 hay Nghị quyết 36 năm 2004 thành quyết định tại Đại hội IX. Các nội dung đó có nguồn và mốc riêng ở khu vực bên dưới.',
      sourceType: 'dien giai',
    },
    sources: [source('unity-148', 148, 'Động lực chủ yếu để phát triển đất nước là đại đoàn kết toàn dân trên cơ sở liên minh giữa công nhân với nông dân và trí thức do Đảng lãnh đạo,')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu định hướng đoàn kết tại trang 148; chính sách chuyên đề được đặt ở phần triển khai sau Đại hội.' },
  },
  {
    id: 'defense',
    number: '08',
    title: 'Bảo vệ Tổ quốc, quốc phòng và an ninh',
    shortTitle: 'Bảo vệ Tổ quốc',
    icon: 'ShieldCheck',
    theme: 'red',
    pattern: 'shield',
    summary: {
      text: 'Đại hội IX nêu quan hệ hợp tác và đấu tranh trong nội bộ nhân dân, đoàn kết và hợp tác lâu dài trong sự nghiệp xây dựng và bảo vệ Tổ quốc; đồng thời đặt nhiệm vụ bảo vệ độc lập dân tộc trong nội dung đấu tranh hiện nay.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('peace', 'Hoãn nhiệm vụ bảo vệ để tập trung kinh tế', 'Đề xuất mô phỏng: tách phát triển khỏi yêu cầu xây dựng và bảo vệ Tổ quốc.'),
      discussionChoice('capacity', 'Xem bảo vệ Tổ quốc là việc riêng của lực lượng vũ trang', 'Đề xuất mô phỏng: không gắn đoàn kết, hợp tác trong nhân dân với nhiệm vụ bảo vệ Tổ quốc.'),
      discussionChoice('integrated', 'Đoàn kết, hợp tác lâu dài để xây dựng và bảo vệ Tổ quốc', 'Đại hội IX nêu quan hệ hợp tác và đấu tranh trong nội bộ nhân dân; gắn đoàn kết, hợp tác lâu dài với xây dựng, bảo vệ Tổ quốc và bảo vệ độc lập dân tộc.', 'official'),
    ],
    congressDirection: {
      text: 'Hướng Đại hội IX được giáo trình ghi ở mức nguyên tắc: đoàn kết, hợp tác lâu dài trong sự nghiệp xây dựng và bảo vệ Tổ quốc, bảo vệ độc lập dân tộc. Chiến lược bảo vệ Tổ quốc trong tình hình mới được Hội nghị Trung ương 8 thông qua tháng 7-2003, thuộc phần triển khai sau Đại hội.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Giáo trình ghi định hướng chung tại Đại hội IX ở trang 147 và tách Chiến lược bảo vệ Tổ quốc trong tình hình mới do Hội nghị Trung ương 8 (7-2003) ban hành ở phần triển khai sau Đại hội, trang 152–153.',
      sourceType: 'dien giai',
    },
    sources: [source('defense-147', 147, 'Quan hệ các giai cấp, các tầng lớp xã hội là quan hệ hợp tác và đấu tranh trong nội bộ nhân dân, đoàn kết và hợp tác lâu dài trong sự nghiệp xây dựng và bảo vệ Tổ quốc.'), source('defense-147-independence', 147, 'đấu tranh làm thất bại mọi âm mưu và hành động chống phá của các thế lực thù địch; bảo vệ độc lập dân tộc,')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu định hướng chung tại trang 147; Chiến lược năm 2003 được tách riêng ở phần triển khai sau Đại hội.' },
  },
  {
    id: 'party-building',
    number: '09',
    title: 'Xây dựng Đảng',
    shortTitle: 'Xây dựng Đảng',
    icon: 'Building2',
    theme: 'gold',
    pattern: 'column',
    summary: {
      text: 'Đại hội IX bầu Ban Chấp hành Trung ương mới và khẳng định đường lối đúng đắn của Đảng là nhân tố quyết định thành công của sự nghiệp đổi mới; đây là định hướng về vai trò lãnh đạo được nêu trong các bài học đổi mới.',
      sourceType: 'dien giai',
    },
    choices: [
      discussionChoice('organization', 'Chỉ chú trọng bộ máy tổ chức', 'Đề xuất mô phỏng: đánh giá vai trò lãnh đạo qua cơ cấu, không xét đường lối và thực tiễn đổi mới.'),
      discussionChoice('people', 'Thay đổi đường lối theo áp lực ngắn hạn', 'Đề xuất mô phỏng: đặt phản ứng tức thời lên trên việc giữ đường lối đúng đắn.'),
      discussionChoice('leadership', 'Giữ vững đường lối đúng đắn của Đảng', 'Đại hội IX khẳng định đường lối đúng đắn của Đảng là nhân tố quyết định thành công của sự nghiệp đổi mới.', 'official'),
    ],
    congressDirection: {
      text: 'Giáo trình ghi Đại hội IX bầu Ban Chấp hành Trung ương mới (trang 146) và nêu đường lối đúng đắn của Đảng là nhân tố quyết định thành công của đổi mới (trang 147). Cụm “nhiệm vụ then chốt” về xây dựng Đảng ở trang 153 thuộc nội dung triển khai sau Đại hội tại Hội nghị Trung ương 8 năm 2003.',
      sourceType: 'dien giai',
    },
    comparisonExplanation: {
      text: 'Phần đối chiếu dựa trên vai trò lãnh đạo và bài học về đường lối đúng đắn ở trang 147. Giáo trình đặt nội dung xây dựng Đảng trong Chiến lược bảo vệ Tổ quốc tại Hội nghị Trung ương 8 năm 2003 ở phần triển khai sau Đại hội.',
      sourceType: 'dien giai',
    },
    sources: [source('party-146', 146, 'đã bầu ra Ban Chấp hành Trung ương mới gồm 150 ủy viên.'), source('party-147', 147, 'Đường lối đúng đắn của Đảng là nhân tố quyết định thành công của sự nghiệp đổi mới.')],
    verification: { status: 'verified', sourceType: 'dien giai', text: 'Đối chiếu sự kiện tổ chức trang 146 và bài học về vai trò đường lối của Đảng trang 147.' },
  },
];

export const afterCongress = {
  id: 'after-congress',
  title: 'Triển khai sau Đại hội IX',
  subtitle: 'Các nội dung trong toàn khóa IX, có mốc thời gian và chủ thể riêng; không phải biên bản quyết nghị của Đại hội IX.',
  sourceType: 'dien giai',
  entries: [
    {
      id: 'land', title: 'Đất đai', year: '2003', icon: 'Sprout', sourceType: 'dien giai',
      text: 'Hội nghị Trung ương 7 (3-2003) thảo luận đổi mới chính sách, pháp luật về đất đai; giáo trình trình bày đất đai là tài nguyên quốc gia và tư liệu sản xuất đặc biệt.',
      sources: [source('land-149', 149, 'đã thống nhất nhận thức coi đất đai là tài nguyên quốc gia vô cùng quý giá, là tư liệu sản xuất đặc biệt,')],
    },
    {
      id: 'thought', title: 'Công tác tư tưởng, lý luận', year: '2002–2003', icon: 'Lightbulb', sourceType: 'dien giai',
      text: 'Hội nghị Trung ương 5 (3-2002) nêu nhiệm vụ công tác tư tưởng, lý luận; Chỉ thị 23-CT/TW ngày 27-3-2003 nói về nghiên cứu, tuyên truyền và giáo dục tư tưởng Hồ Chí Minh.',
      sources: [source('thought-150', 150, 'Hội nghị Trung ương 5 (3-2002) đã đưa ra những nhiệm vụ chủ yếu của công tác tư tưởng, lý luận của Đảng trong tình hình mới'), source('thought-151', 150, 'Ngày 27-3-2003, Ban Bí thư đã ra Chỉ thị số 23-CT/TW về đẩy mạnh nghiên cứu, tuyên truyền, giáo dục tư tưởng Hồ Chí Minh')],
    },
    {
      id: 'unity-followup', title: 'Đại đoàn kết, dân tộc và tôn giáo', year: '2003', icon: 'UsersRound', sourceType: 'dien giai',
      text: 'Giáo trình gắn các nghị quyết về đại đoàn kết, công tác dân tộc và tôn giáo với Hội nghị Trung ương 7 (3-2003), nêu quyền tự do tín ngưỡng và yêu cầu đoàn kết, bình đẳng giữa các dân tộc.',
      sources: [source('unity-151', 151, 'Hội nghị Trung ương 7 (3-2003) đã ban hành ba Nghị quyết quan trọng.'), source('religion-152', 151, 'Đảng, Nhà nước thực hiện nhất quán chính sách tôn trọng và bảo đảm quyền tự do tín ngưỡng, theo hoặc không theo một tôn giáo nào,')],
    },
    {
      id: 'overseas', title: 'Người Việt Nam ở nước ngoài', year: '2004', icon: 'Globe2', sourceType: 'dien giai',
      text: 'Bộ Chính trị khóa IX ban hành Nghị quyết số 36 tháng 3-2004; giáo trình ghi nhận chủ trương coi người Việt Nam ở nước ngoài là bộ phận không tách rời và là nguồn lực của cộng đồng dân tộc.',
      sources: [source('overseas-152', 152, 'Nghị quyết số 36')],
    },
    {
      id: 'defense-followup', title: 'Chiến lược bảo vệ Tổ quốc', year: '2003', icon: 'ShieldCheck', sourceType: 'dien giai',
      text: 'Hội nghị Trung ương 8 (7-2003) thảo luận và ban hành Chiến lược bảo vệ Tổ quốc trong tình hình mới. Đây là nội dung triển khai sau Đại hội IX.',
      sources: [source('defense-152', 152, 'Chiến lược Bảo vệ Tổ quốc trong tình hình mới'), source('defense-153', 153, 'Nhiệm vụ cơ bản về bảo vệ Tổ quốc: Giữ vững hòa bình, ổn định để thực hiện thắng lợi sự nghiệp công nghiệp hóa, hiện đại hóa đất nước theo định hướng xã hội chủ nghĩa.')],
    },
    {
      id: 'party-followup', title: 'Xây dựng Đảng trong chiến lược sau Đại hội', year: '2003', icon: 'Building2', sourceType: 'dien giai',
      text: 'Trong phần trình bày Chiến lược bảo vệ Tổ quốc tại Hội nghị Trung ương 8, giáo trình nêu xây dựng Đảng gắn với bảo vệ Đảng và an ninh chính trị nội bộ. Không quy nội dung này thành kết luận bỏ phiếu tại Đại hội IX.',
      sources: [source('party-153', 153, 'kết hợp chặt chẽ với bảo vệ Đảng, bảo vệ vững chắc an ninh chính trị nội bộ.')],
    },
  ],
};

export const knowledgeMap = {
  nodes: [
    { id: 'context', label: 'Bối cảnh đổi mới', x: 10, y: 43, dossierId: 'context', sourceType: 'dien giai' },
    { id: 'path', label: 'Con đường XHCN', x: 31, y: 21, dossierId: 'socialist-path', sourceType: 'dien giai' },
    { id: 'market', label: 'Kinh tế thị trường', x: 51, y: 39, dossierId: 'market-economy', sourceType: 'dien giai' },
    { id: 'strategy', label: 'Chiến lược 2001–2010', x: 75, y: 19, dossierId: 'strategy', sourceType: 'dien giai' },
    { id: 'culture', label: 'Văn hóa · xã hội', x: 72, y: 70, dossierId: 'culture-society', sourceType: 'dien giai' },
    { id: 'foreign', label: 'Đối ngoại', x: 46, y: 81, dossierId: 'foreign-relations', sourceType: 'dien giai' },
    { id: 'unity', label: 'Đại đoàn kết', x: 25, y: 66, dossierId: 'unity', sourceType: 'dien giai' },
    { id: 'defense', label: 'Bảo vệ Tổ quốc', x: 89, y: 45, dossierId: 'defense', sourceType: 'dien giai' },
    { id: 'party', label: 'Xây dựng Đảng', x: 48, y: 56, dossierId: 'party-building', sourceType: 'dien giai' },
  ],
  edges: [
    ['context', 'path'], ['context', 'market'], ['path', 'market'], ['market', 'strategy'],
    ['strategy', 'culture'], ['culture', 'unity'], ['unity', 'foreign'], ['foreign', 'defense'],
    ['defense', 'party'], ['party', 'context'], ['market', 'foreign'],
  ],
  sourceType: 'dien giai',
};

export const reviewQuestions = [
  { id: 'q1', question: 'Những điểm nào trong bối cảnh sau gần 15 năm đổi mới khiến Đại hội IX vừa ghi nhận thành tựu vừa nhấn mạnh yêu cầu tiếp tục đổi mới?', answer: 'Đổi mới tạo thế và lực mới, nhưng kinh tế phát triển chưa vững chắc, hiệu quả và sức cạnh tranh còn thấp; chỉ tiêu tăng trưởng 5 năm Đại hội VIII đề ra chưa đạt. Vì vậy, Đại hội IX tiếp tục đổi mới toàn diện và nhấn mạnh các bài học về mục tiêu, nhân dân, sáng tạo và đường lối đúng.', sourceType: 'mo phong' },
  { id: 'q2', question: 'Kinh tế thị trường định hướng xã hội chủ nghĩa được trình bày ra sao, và các hình thức phân phối được nêu như thế nào?', answer: 'Đó là kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường, có Nhà nước quản lý theo định hướng xã hội chủ nghĩa. Phân phối chủ yếu theo kết quả lao động và hiệu quả kinh tế, đồng thời theo đóng góp vốn, nguồn lực khác và qua phúc lợi xã hội.', sourceType: 'mo phong' },
  { id: 'q3', question: 'Đại hội IX giải thích “bỏ qua chế độ tư bản chủ nghĩa” trong con đường quá độ lên chủ nghĩa xã hội như thế nào?', answer: 'Bỏ qua việc xác lập vị trí thống trị của quan hệ sản xuất và kiến trúc thượng tầng tư bản chủ nghĩa; đồng thời tiếp thu, kế thừa thành tựu nhân loại, nhất là khoa học và công nghệ, để phát triển lực lượng sản xuất và xây dựng nền kinh tế hiện đại (tr. 147).', sourceType: 'mo phong' },
];

export const chatSuggestions = [
  'Đại hội IX nhận định thế nào về 15 năm đổi mới?',
  'Con đường quá độ lên chủ nghĩa xã hội được giải thích ra sao?',
  'Đại hội IX xác định mô hình kinh tế thị trường thế nào?',
  'Văn hóa có vị trí gì trong định hướng Đại hội IX?',
  'Đại hội IX thông qua mục tiêu nào cho Chiến lược 2001–2010?',
  'Chiến lược bảo vệ Tổ quốc năm 2003 thuộc giai đoạn nào?',
];

export const sourceTypeLabels = {
  'giao trinh': 'Giáo trình',
  'dien giai': 'Diễn giải',
  'minh hoa': 'Minh họa trang trí',
  'mo phong': 'Mô phỏng thảo luận',
};
