import connectDB from '@/lib/db';
import { User, Category, Post } from '@/lib/models';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

// Sample seed data for the news website
const categories = [
  { name: 'Politics', slug: 'politics', description: 'Political news and analysis', color: '#DC2626', icon: 'landmark' },
  { name: 'Technology', slug: 'technology', description: 'Latest tech news and innovations', color: '#2563EB', icon: 'cpu' },
  { name: 'Sports', slug: 'sports', description: 'Sports coverage and highlights', color: '#16A34A', icon: 'trophy' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, and celebrity news', color: '#9333EA', icon: 'film' },
  { name: 'Business', slug: 'business', description: 'Business and financial news', color: '#EA580C', icon: 'briefcase' },
  { name: 'Health', slug: 'health', description: 'Health and wellness updates', color: '#0D9488', icon: 'heart-pulse' },
  { name: 'World', slug: 'world', description: 'International news coverage', color: '#4F46E5', icon: 'globe' },
  { name: 'Local', slug: 'local', description: 'Local community news', color: '#CA8A04', icon: 'map-pin' },
];

const samplePosts = [
  {
    title: 'Revolutionary AI Technology Transforms Healthcare Industry',
    excerpt: 'New artificial intelligence systems are helping doctors diagnose diseases with unprecedented accuracy, marking a new era in medical technology.',
    content: `<p>In a groundbreaking development that could reshape the future of healthcare, researchers have unveiled a new AI-powered diagnostic system that achieves 98% accuracy in detecting early-stage cancers.</p>
    <h2>The Technology Behind the Breakthrough</h2>
    <p>The system, developed by a team of international researchers, uses deep learning algorithms trained on millions of medical images and patient records. Unlike traditional diagnostic methods, this AI can identify subtle patterns that might escape even experienced physicians.</p>
    <blockquote>"This represents one of the most significant advances in medical diagnostics we've seen in decades," said Dr. Sarah Chen, lead researcher at the Institute for Medical AI.</blockquote>
    <h2>Real-World Applications</h2>
    <p>Several hospitals have already begun pilot programs to integrate this technology into their diagnostic workflows. Early results show a 40% reduction in diagnostic time and a significant decrease in false negatives.</p>
    <p>The implications extend beyond cancer detection. The same underlying technology is being adapted for:</p>
    <ul>
    <li>Cardiovascular disease prediction</li>
    <li>Neurological disorder identification</li>
    <li>Rare disease diagnosis</li>
    <li>Drug interaction analysis</li>
    </ul>
    <h2>Looking Ahead</h2>
    <p>As this technology continues to evolve, experts predict that AI-assisted diagnosis will become the standard of care within the next decade, fundamentally changing how medical professionals approach patient care.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=630&fit=crop',
    categorySlug: 'technology',
    tags: ['AI', 'Healthcare', 'Innovation', 'Medical Technology'],
    isFeatured: true,
    isTrending: true,
    isBreaking: true,
  },
  {
    title: 'Global Climate Summit Reaches Historic Agreement on Carbon Emissions',
    excerpt: 'World leaders commit to ambitious new targets in landmark climate deal that could reshape global energy policies for decades.',
    content: `<p>In what environmental advocates are calling a watershed moment for climate action, representatives from 195 nations have signed a comprehensive agreement to drastically reduce carbon emissions over the next 30 years.</p>
    <h2>Key Provisions of the Agreement</h2>
    <p>The agreement includes binding commitments to:</p>
    <ul>
    <li>Reduce global emissions by 60% by 2040</li>
    <li>Establish a $500 billion green technology fund</li>
    <li>Phase out coal power plants by 2035</li>
    <li>Protect 30% of Earth's land and oceans</li>
    </ul>
    <h2>Economic Implications</h2>
    <p>While the agreement has been praised by environmentalists, some economists warn of potential short-term economic disruptions as nations transition away from fossil fuels.</p>
    <p>However, proponents argue that the long-term economic benefits of avoiding climate catastrophe far outweigh the transition costs.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1200&h=630&fit=crop',
    categorySlug: 'world',
    tags: ['Climate', 'Environment', 'Politics', 'International'],
    isFeatured: true,
    isTrending: true,
    isBreaking: false,
  },
  {
    title: 'Championship Finals Break All Viewership Records',
    excerpt: 'The thrilling seven-game series captivated audiences worldwide, becoming the most-watched sporting event in television history.',
    content: `<p>The championship finals concluded last night with an epic game seven that drew over 150 million viewers worldwide, shattering all previous viewership records for a sporting event.</p>
    <h2>A Series for the Ages</h2>
    <p>The dramatic series featured multiple overtime games, last-second victories, and performances that will be remembered for generations. The winning team overcame a 3-1 deficit to claim their first title in franchise history.</p>
    <h2>Fan Reactions</h2>
    <p>Celebrations erupted across the city as fans poured into the streets to celebrate the historic victory. The team's star player, who was named MVP, delivered a memorable post-game speech that has already gone viral.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1461896836934- voices-at-sporting-event?w=1200&h=630&fit=crop',
    categorySlug: 'sports',
    tags: ['Championship', 'Basketball', 'Records', 'Sports History'],
    isFeatured: true,
    isTrending: true,
    isBreaking: false,
  },
  {
    title: 'Stock Markets Surge as Economic Recovery Exceeds Expectations',
    excerpt: 'Major indices hit new highs as unemployment drops and consumer spending rebounds strongly.',
    content: `<p>Financial markets around the world surged to record highs today as new economic data revealed that the post-pandemic recovery is proceeding faster than most analysts had predicted.</p>
    <h2>Key Economic Indicators</h2>
    <p>The latest reports show:</p>
    <ul>
    <li>Unemployment fell to 3.2%, the lowest in 50 years</li>
    <li>Consumer spending increased 5.8% quarter over quarter</li>
    <li>Manufacturing output reached pre-pandemic levels</li>
    <li>Housing starts exceeded analyst expectations</li>
    </ul>
    <h2>Market Response</h2>
    <p>The S&P 500 rose 2.3% in early trading, while the tech-heavy NASDAQ gained 3.1%. International markets followed suit, with European and Asian indices posting similar gains.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop',
    categorySlug: 'business',
    tags: ['Markets', 'Economy', 'Finance', 'Investing'],
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
  },
  {
    title: 'Breakthrough Study Reveals New Benefits of Mediterranean Diet',
    excerpt: 'Research spanning 20 years confirms significant health improvements for those following traditional eating patterns.',
    content: `<p>A comprehensive new study published in the Journal of Clinical Nutrition provides the most compelling evidence yet for the health benefits of the Mediterranean diet.</p>
    <h2>Study Findings</h2>
    <p>The 20-year study, which followed over 25,000 participants, found that those who closely adhered to the Mediterranean diet experienced:</p>
    <ul>
    <li>32% lower risk of heart disease</li>
    <li>25% reduction in cognitive decline</li>
    <li>18% lower all-cause mortality</li>
    <li>Improved markers of inflammation</li>
    </ul>
    <h2>What is the Mediterranean Diet?</h2>
    <p>The diet emphasizes whole grains, fresh fruits and vegetables, olive oil, nuts, fish, and moderate wine consumption while limiting processed foods and red meat.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=630&fit=crop',
    categorySlug: 'health',
    tags: ['Nutrition', 'Diet', 'Research', 'Wellness'],
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
  },
  {
    title: 'Award Season Kicks Off with Surprising Nominations',
    excerpt: 'This year\'s nominees include several unexpected choices that have delighted fans and critics alike.',
    content: `<p>The entertainment industry is buzzing with excitement as this year's award nominations were announced, featuring several surprising picks that have sparked animated debate across social media.</p>
    <h2>Notable Nominations</h2>
    <p>Among the most discussed nominations:</p>
    <ul>
    <li>A streaming-only film leads all categories with 12 nominations</li>
    <li>Three first-time directors received nominations</li>
    <li>International films received unprecedented recognition</li>
    <li>Documentary categories saw record diversity</li>
    </ul>
    <h2>Industry Reactions</h2>
    <p>Industry insiders are calling this year's nominations a sign of changing times, reflecting evolving audience tastes and the growing influence of streaming platforms.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=630&fit=crop',
    categorySlug: 'entertainment',
    tags: ['Awards', 'Movies', 'Television', 'Streaming'],
    isFeatured: true,
    isTrending: false,
    isBreaking: false,
  },
  {
    title: 'New Legislation Aims to Reform Digital Privacy Laws',
    excerpt: 'Bipartisan bill would give consumers unprecedented control over their personal data.',
    content: `<p>A bipartisan group of lawmakers has introduced sweeping legislation that would fundamentally reshape how companies collect, store, and use personal data.</p>
    <h2>Key Provisions</h2>
    <p>The proposed Digital Privacy Act includes:</p>
    <ul>
    <li>Mandatory data deletion upon request</li>
    <li>Strict limits on data sharing with third parties</li>
    <li>Transparent algorithms for content recommendations</li>
    <li>Enhanced protections for children's data</li>
    </ul>
    <h2>Industry Response</h2>
    <p>Tech companies have expressed mixed reactions, with some praising the clarity the law would provide and others warning of implementation challenges.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=630&fit=crop',
    categorySlug: 'politics',
    tags: ['Privacy', 'Legislation', 'Technology', 'Congress'],
    isFeatured: false,
    isTrending: false,
    isBreaking: true,
  },
  {
    title: 'Local Community Garden Project Transforms Urban Neighborhood',
    excerpt: 'Volunteer initiative turns abandoned lot into thriving green space, bringing residents together.',
    content: `<p>What was once an abandoned, trash-strewn lot has been transformed into a vibrant community garden, thanks to the dedication of local volunteers and a innovative partnership between residents and city officials.</p>
    <h2>The Transformation</h2>
    <p>Over the past year, more than 100 volunteers have contributed thousands of hours to create:</p>
    <ul>
    <li>50 individual garden plots for families</li>
    <li>A community orchard with 25 fruit trees</li>
    <li>An outdoor classroom for local schools</li>
    <li>Native plant gardens to support pollinators</li>
    </ul>
    <h2>Community Impact</h2>
    <p>Residents report that the garden has transformed not just the physical space, but the social fabric of the neighborhood, creating connections between neighbors who had never met.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=630&fit=crop',
    categorySlug: 'local',
    tags: ['Community', 'Environment', 'Urban Development', 'Volunteering'],
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
  },
  {
    title: 'Electric Vehicle Sales Surpass Gasoline Cars for First Time',
    excerpt: 'Milestone moment for the automotive industry as consumer preferences shift dramatically toward sustainable transportation.',
    content: `<p>In a historic shift for the automotive industry, electric vehicle sales have surpassed traditional gasoline-powered cars for the first time in major markets.</p>
    <h2>The Numbers</h2>
    <p>According to industry data, EVs accounted for 51% of new vehicle sales last month, driven by:</p>
    <ul>
    <li>Expanded charging infrastructure</li>
    <li>Improved battery range and technology</li>
    <li>Competitive pricing with traditional vehicles</li>
    <li>Government incentives and regulations</li>
    </ul>
    <h2>What This Means</h2>
    <p>Industry analysts say this milestone marks a point of no return, predicting that gasoline-powered vehicles will become increasingly rare within the next decade.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=630&fit=crop',
    categorySlug: 'technology',
    tags: ['Electric Vehicles', 'Automotive', 'Sustainability', 'Transportation'],
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
  },
  {
    title: 'Scientists Discover New Species in Deep Ocean Expedition',
    excerpt: 'Research vessel captures footage and samples of previously unknown marine life at record depths.',
    content: `<p>A scientific expedition to the deepest parts of the Pacific Ocean has returned with evidence of at least 30 previously unknown species, expanding our understanding of life in Earth's most extreme environments.</p>
    <h2>Remarkable Discoveries</h2>
    <p>Among the discoveries are:</p>
    <ul>
    <li>A bioluminescent fish with unique hunting adaptations</li>
    <li>Several new species of deep-sea corals</li>
    <li>Microorganisms that thrive in extreme pressure</li>
    <li>An unusual squid species with transparent skin</li>
    </ul>
    <h2>Scientific Significance</h2>
    <p>The findings underscore how much remains unknown about Earth's oceans, with scientists estimating that millions of marine species have yet to be discovered.</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&h=630&fit=crop',
    categorySlug: 'world',
    tags: ['Science', 'Ocean', 'Discovery', 'Marine Biology'],
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
  },
];

export async function seedDatabase() {
  try {
    await connectDB();

    // Check if data already exists
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      return { success: true, message: 'Database already seeded' };
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@newsportal.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'News Portal Administrator',
    });

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = new Map(createdCategories.map(c => [c.slug, c._id]));

    // Create posts with proper category references and slugs
    const postsToCreate = samplePosts.map((post, index) => {
      const timestamp = (Date.now() + index).toString(36);
      const slug = slugify(post.title, { lower: true, strict: true }) + '-' + timestamp;
      const content = post.content.replace(/<[^>]*>/g, '');
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      return {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        author: admin._id,
        category: categoryMap.get(post.categorySlug),
        tags: post.tags,
        status: 'published',
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 10000) + 100,
        readingTime,
        isFeatured: post.isFeatured,
        isTrending: post.isTrending,
        isBreaking: post.isBreaking,
      };
    });

    await Post.insertMany(postsToCreate);

    // Update category post counts
    for (const [slug] of categoryMap) {
      const count = await Post.countDocuments({ 
        category: categoryMap.get(slug),
        status: 'published' 
      });
      await Category.findByIdAndUpdate(categoryMap.get(slug), { postCount: count });
    }

    return { 
      success: true, 
      message: 'Database seeded successfully',
      admin: { email: 'admin@newsportal.com', password: 'admin123' }
    };
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}
