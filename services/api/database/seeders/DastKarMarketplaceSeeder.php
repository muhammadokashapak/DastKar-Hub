<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\CustomizationOption;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\SellerProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DastKarMarketplaceSeeder extends Seeder
{
    // Curated high-res authentic craft image catalogs
    private array $craftImagePool = [
        'pottery' => [
            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590483256037-33630f9a2e63?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
        ],
        'woodwork' => [
            'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        ],
        'textiles' => [
            'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
        ],
        'leather' => [
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        ],
        'jewelry' => [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        ],
        'decor' => [
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        ],
    ];

    public function run(): void
    {
        $this->command->info('Populating DastKar Hub with comprehensive Pakistani handmade marketplace data...');

        // 1. Seed or Sync 16 Craft Categories & Subcategories
        $categoriesMap = $this->seedCategories();

        // 2. Seed 48 Realistic Pakistani Makers (10% established, 60% verified, 30% new makers)
        $makers = $this->seedMakers();

        // 3. Seed Demo Buyers
        $buyers = $this->seedBuyers();

        // 4. Seed 320+ Authentic Craft Products
        $products = $this->seedProducts($categoriesMap, $makers);

        // 5. Seed Demo Orders & Reviews (Marked is_seeded = true)
        $this->seedOrdersAndReviews($products, $makers, $buyers);

        $this->command->info('Marketplace population completed successfully!');
    }

    private function seedCategories(): array
    {
        $definitions = [
            [
                'name' => 'Jewelry & Accessories',
                'slug' => 'jewelry-accessories',
                'icon' => 'sparkles',
                'image_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Earrings & Jhumkas', 'Necklaces & Chokers', 'Bracelets & Karras', 'Rings', 'Traditional Kundan & Polki'],
            ],
            [
                'name' => 'Clothing & Textiles',
                'slug' => 'clothing-textiles',
                'icon' => 'shirt',
                'image_url' => 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Embroidered Kurtas', 'Handwoven Textiles', 'Pure Silk Dupattas', 'Handloom Shawls', 'Traditional Block Prints'],
            ],
            [
                'name' => 'Leather Crafts',
                'slug' => 'leather-crafts',
                'icon' => 'briefcase',
                'image_url' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Handstitched Wallets', 'Peshawari Chappals', 'Full-Grain Leather Belts', 'Messenger Bags', 'Leather Card Holders'],
            ],
            [
                'name' => 'Pottery & Ceramics',
                'slug' => 'pottery-ceramics',
                'icon' => 'coffee',
                'image_url' => 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Multani Blue Pottery Mugs', 'Kashikari Bowls', 'Glazed Vases', 'Ceramic Serving Plates', 'Terracotta Planters'],
            ],
            [
                'name' => 'Woodwork',
                'slug' => 'woodwork',
                'icon' => 'hammer',
                'image_url' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Chinioti Carved Trays', 'Brass Inlay Keepsake Boxes', 'Calligraphy Wall Plaques', 'Rosewood Tables', 'Carved Book Stands'],
            ],
            [
                'name' => 'Home Décor',
                'slug' => 'home-decor',
                'icon' => 'home',
                'image_url' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Camel Skin Painted Lamps', 'Beaten Brass Lanterns', 'Mirror Mosaic Frames', 'Hanging Wall Tapestries', 'Onyx Stone Sculptures'],
            ],
            [
                'name' => 'Embroidery',
                'slug' => 'embroidery',
                'icon' => 'scissors',
                'image_url' => 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Sindhi Hurmicho Work', 'Balochi Tanka Cushions', 'Phulkari Stoles', 'Shadow Work Kurtis', 'Zardozi Wall Art'],
            ],
            [
                'name' => 'Crochet & Knitting',
                'slug' => 'crochet-knitting',
                'icon' => 'heart',
                'image_url' => 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Crochet Market Totes', 'Woven Flower Baskets', 'Artisan Baby Booties', 'Woolen Winter Scarves', 'Crocheted Coasters'],
            ],
            [
                'name' => 'Hand-Painted Art',
                'slug' => 'hand-painted-art',
                'icon' => 'palette',
                'image_url' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Pakistani Truck Art Wall Décor', 'Mughal Miniature Paintings', 'Arabic Calligraphy Canvases', 'Hand-painted Tea Trays', 'Ceramic Tile Wall Panels'],
            ],
            [
                'name' => 'Traditional Crafts',
                'slug' => 'traditional-crafts',
                'icon' => 'shield',
                'image_url' => 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Sindhi Ralli Patchwork Quilts', 'Multani Camel Bone Inlay', 'Sindhi Topis', 'Handspun Khaddar', 'Clay Hookah Replicas'],
            ],
            [
                'name' => 'Customized Gifts',
                'slug' => 'customized-gifts',
                'icon' => 'gift',
                'image_url' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Custom Resin Door Nameplates', 'Engraved Walnut Memory Boxes', 'Personalized Leather Journals', 'Custom Calligraphy Frames', 'Handmade Wedding Keepsakes'],
            ],
            [
                'name' => 'Bags & Wallets',
                'slug' => 'bags-wallets',
                'icon' => 'shopping-bag',
                'image_url' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Embroidered Bridal Potli Bags', 'Full Grain Leather Satchels', 'Eco Jute Market Totes', 'Raw Silk Clutches', 'Travel Passport Holders'],
            ],
            [
                'name' => 'Shawls & Scarves',
                'slug' => 'shawls-scarves',
                'icon' => 'feather',
                'image_url' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Kashmiri Sozni Pashmina', 'Swati Hand-spun Woolen Shawls', 'Natural Indigo Ajrak Shawls', 'Dera Ismail Khan Chunri', 'Fine Wool Chaddars'],
            ],
            [
                'name' => 'Pakistani Heritage',
                'slug' => 'pakistani-heritage',
                'icon' => 'flag',
                'image_url' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Lok Virsa Folk Crafts', 'Gandhara Terracotta Sculptures', 'Taxila Stone Carvings', 'Harappa Replica Seals', 'Sufi Musical Instruments'],
            ],
            [
                'name' => 'Wedding & Festive',
                'slug' => 'wedding-festive',
                'icon' => 'sun',
                'image_url' => 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Velvet Nikah Certificate Holders', 'Bridal Dupattas', 'Handcrafted Mehndi Trays', 'Zardozi Shadi Favor Boxes', 'Gota Kinari Accessories'],
            ],
            [
                'name' => 'Home & Kitchen Crafts',
                'slug' => 'home-kitchen-crafts',
                'icon' => 'utensils',
                'image_url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
                'subcategories' => ['Hand-carved Sheesham Chopping Boards', 'Natural Onyx Mortar & Pestle', 'Hand-beaten Pure Brass Serving Spoons', 'Terracotta Baking Pots', 'Copper Water Goblets'],
            ],
        ];

        $categoriesMap = [];

        foreach ($definitions as $order => $def) {
            $cat = Category::updateOrCreate(
                ['slug' => $def['slug']],
                [
                    'name' => $def['name'],
                    'icon' => $def['icon'],
                    'image_url' => $def['image_url'],
                    'status' => 'active',
                    'sort_order' => $order + 1,
                ]
            );

            $subcatIds = [];
            foreach ($def['subcategories'] as $subOrder => $subName) {
                $subSlug = Str::slug($def['slug'] . '-' . $subName);
                $sub = Category::updateOrCreate(
                    ['slug' => $subSlug],
                    [
                        'parent_id' => $cat->id,
                        'name' => $subName,
                        'status' => 'active',
                        'sort_order' => $subOrder + 1,
                    ]
                );
                $subcatIds[] = $sub->id;
            }

            $categoriesMap[] = [
                'parent' => $cat,
                'subcategories' => $subcatIds,
            ];
        }

        return $categoriesMap;
    }

    private function seedMakers(): array
    {
        // 48 makers representing Pakistani craft cities & verification distribution
        // 5 established (~10%), 29 verified (~60%), 14 new makers (~30%)
        $makerTemplates = [
            // ESTABLISHED MAKERS (High orders, top rating, seasoned age)
            [
                'name' => 'Ustad Fayyaz Kashigar',
                'business_name' => 'Kashigari Blue Pottery Studio',
                'slug' => 'kashigari-blue-pottery',
                'city' => 'Multan',
                'region' => 'Punjab',
                'craft' => 'Multani Cobalt Blue Glazed Pottery & Kashikari Tilecraft',
                'bio' => 'Inherited from four generations of master kashigars in Multan, blending local river silt clay with rich cobalt oxide glazes.',
                'verification_status' => 'established',
                'rating_avg' => 4.96,
                'rating_count' => 64,
                'completed_orders' => 128,
                'total_sales' => 384000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Mian Tariq Sheesham',
                'business_name' => 'Chiniot Woodcraft & Brass Inlay',
                'slug' => 'chiniot-woodcraft-brass',
                'city' => 'Chiniot',
                'region' => 'Punjab',
                'craft' => 'Solid Dalbergia Sissoo (Rosewood) Furniture & Delicate Brass Inlay',
                'bio' => 'Preserving 300 years of Chinioti heritage. Every jewel box, chess board, and console table is hand-chiseled from seasoned sheesham.',
                'verification_status' => 'established',
                'rating_avg' => 4.92,
                'rating_count' => 52,
                'completed_orders' => 96,
                'total_sales' => 540000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Haji Ghulam Rasool',
                'business_name' => 'Peshawar Heritage Leatherworks',
                'slug' => 'peshawar-heritage-leatherworks',
                'city' => 'Peshawar',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Authentic Handcrafted Peshawari Chappals & Full-Grain Accessories',
                'bio' => 'Hand-cut tire-sole sandals and pure harness leather shoes crafted near Namak Mandi, Peshawar.',
                'verification_status' => 'established',
                'rating_avg' => 4.88,
                'rating_count' => 45,
                'completed_orders' => 84,
                'total_sales' => 310000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Mai Bhagi & Sons',
                'business_name' => 'Hala Block Print & Terracotta Guild',
                'slug' => 'hala-block-print-guild',
                'city' => 'Hala',
                'region' => 'Sindh',
                'craft' => 'Natural Mineral Indigo Ajrak & Sindh Glazed Terracotta',
                'bio' => 'Using hand-carved teak woodblocks and authentic 21-stage indigo and madder root natural dyeing on handloom cotton.',
                'verification_status' => 'established',
                'rating_avg' => 4.94,
                'rating_count' => 58,
                'completed_orders' => 110,
                'total_sales' => 420000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Mirza Aslam Beg',
                'business_name' => 'Swat Valley Pashmina & Weavers',
                'slug' => 'swat-valley-pashmina',
                'city' => 'Swat',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Handspun Mountain Wool Chaddars & Fine Pashmina Shawls',
                'bio' => 'Woven by artisan families in the mountains of Bahrain and Madyan, Swat, on ancestral wooden handlooms.',
                'verification_status' => 'established',
                'rating_avg' => 4.91,
                'rating_count' => 39,
                'completed_orders' => 75,
                'total_sales' => 485000.00,
                'is_new' => false,
            ],

            // VERIFIED MAKERS (Established guilds with reliable history)
            [
                'name' => 'Zainab & Fatima',
                'business_name' => 'Balochi Tanka Embroidery Hub',
                'slug' => 'balochi-tanka-embroidery',
                'city' => 'Quetta',
                'region' => 'Balochistan',
                'craft' => 'Geometric Mirror Stitching & Indigenous Balochi Needlework',
                'bio' => 'Empowering 40 rural women needleworkers across Kalat and Quetta with authentic generational tribal stitches.',
                'verification_status' => 'verified',
                'rating_avg' => 4.85,
                'rating_count' => 24,
                'completed_orders' => 42,
                'total_sales' => 185000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Khurram Shehzad',
                'business_name' => 'Lahore Brass & Copper Guild',
                'slug' => 'lahore-brass-copper-guild',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Hand-beaten Pure Copper Samovars & Brass Lanterns',
                'bio' => 'Located in Kashmiri Bazaar, Walled City of Lahore, preserving centuries of metal beating and filigree engraving.',
                'verification_status' => 'verified',
                'rating_avg' => 4.79,
                'rating_count' => 18,
                'completed_orders' => 31,
                'total_sales' => 142000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Rubina Kausar',
                'business_name' => 'Multan Camel Skin Crafts',
                'slug' => 'multan-camel-skin-crafts',
                'city' => 'Multan',
                'region' => 'Punjab',
                'craft' => 'Painted Camel Skin Table Lamps & Desert Vases',
                'bio' => 'Sun-dried cleaned camel membrane hand-painted with Cholistani Naqqashi floral motifs, glowing warmly when lit.',
                'verification_status' => 'verified',
                'rating_avg' => 4.82,
                'rating_count' => 16,
                'completed_orders' => 28,
                'total_sales' => 95000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Amjad Ali Wazir',
                'business_name' => 'Karakoram Gemstone & Silver Art',
                'slug' => 'karakoram-gemstone-silver',
                'city' => 'Gilgit',
                'region' => 'Gilgit-Baltistan',
                'craft' => 'Natural Lapis Lazuli, Tourmaline & Pure 925 Silver Rings',
                'bio' => 'Ethically mined gems from Shigar and Hunza valleys set into tribal filigree silver jewelry.',
                'verification_status' => 'verified',
                'rating_avg' => 4.88,
                'rating_count' => 21,
                'completed_orders' => 35,
                'total_sales' => 198000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Master Arif Naqqash',
                'business_name' => 'Karachi Truck Art Studio',
                'slug' => 'karachi-truck-art-studio',
                'city' => 'Karachi',
                'region' => 'Sindh',
                'craft' => 'Authentic Chamak Patti Truck Art Décor, Teapots & Trays',
                'bio' => 'Famous Mauripur truck workshop painters translating vibrant highway folk art onto home décor and functional steelware.',
                'verification_status' => 'verified',
                'rating_avg' => 4.84,
                'rating_count' => 29,
                'completed_orders' => 54,
                'total_sales' => 175000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Saeeda Begum',
                'business_name' => 'Cholistan Ralli Quilt Guild',
                'slug' => 'cholistan-ralli-quilt',
                'city' => 'Bahawalpur',
                'region' => 'Punjab',
                'craft' => 'Patchwork Geometric Ralli Quilts & Desert Wall Hangings',
                'bio' => 'Handmade by rural women of the Cholistan desert, combining scrap fabrics into vibrant cultural mosaic tapestries.',
                'verification_status' => 'verified',
                'rating_avg' => 4.78,
                'rating_count' => 14,
                'completed_orders' => 22,
                'total_sales' => 88000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Iqbal & Brothers',
                'business_name' => 'Sialkot Master Leather Guild',
                'slug' => 'sialkot-master-leather',
                'city' => 'Sialkot',
                'region' => 'Punjab',
                'craft' => 'Hand-burnished Vegetable-Tanned Bifold Wallets & Travel Bags',
                'bio' => 'Precision hand-stitching with waxed thread and premium cowhide leather.',
                'verification_status' => 'verified',
                'rating_avg' => 4.81,
                'rating_count' => 22,
                'completed_orders' => 40,
                'total_sales' => 160000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Farzana Naz',
                'business_name' => 'Hazara Crochet & Wool Weaves',
                'slug' => 'hazara-crochet-wool',
                'city' => 'Abbottabad',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Fine Cotton Crochet Totes, Baby Blankets & Knitwear',
                'bio' => 'Hand-crocheted slow fashion crafted by women artisans in the foothills of Abbottabad.',
                'verification_status' => 'verified',
                'rating_avg' => 4.75,
                'rating_count' => 12,
                'completed_orders' => 19,
                'total_sales' => 57000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Ustad Nazeer Ahmed',
                'business_name' => 'Multan Kashikari Tiles',
                'slug' => 'multan-kashikari-tiles',
                'city' => 'Multan',
                'region' => 'Punjab',
                'craft' => 'Architectural Kashikari Ceramic Tiles & Garden Plates',
                'bio' => 'Specialized in cobalt glaze and turquoise earthenware inspired by Shah Rukn-e-Alam shrine architecture.',
                'verification_status' => 'verified',
                'rating_avg' => 4.87,
                'rating_count' => 17,
                'completed_orders' => 30,
                'total_sales' => 115000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Bushra & Co',
                'business_name' => 'Phulkari Floral Studio',
                'slug' => 'phulkari-floral-studio',
                'city' => 'Faisalabad',
                'region' => 'Punjab',
                'craft' => 'Silk Thread Geometrical Phulkari Dupattas & Kurtis',
                'bio' => 'Hand-embroidered pure silk thread folk motifs on handwoven khaddar and chiffon.',
                'verification_status' => 'verified',
                'rating_avg' => 4.80,
                'rating_count' => 15,
                'completed_orders' => 26,
                'total_sales' => 102000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Tariq Mehmood',
                'business_name' => 'Rawalpindi Brass Samovars',
                'slug' => 'rawalpindi-brass-samovars',
                'city' => 'Rawalpindi',
                'region' => 'Punjab',
                'craft' => 'Traditional Brass Tea Sets, Samovars & Spices Boxes',
                'bio' => 'Hand-hammered brassware with tinned interiors for safe everyday traditional tea brewing.',
                'verification_status' => 'verified',
                'rating_avg' => 4.77,
                'rating_count' => 11,
                'completed_orders' => 18,
                'total_sales' => 84000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Nasreen Akhtar',
                'business_name' => 'Kashmiri Sozni Needlecraft',
                'slug' => 'kashmiri-sozni-needlecraft',
                'city' => 'Islamabad',
                'region' => 'Federal',
                'craft' => 'Ultra-fine Sozni Embroidery on Cashmere & Semi-Pashmina',
                'bio' => 'Finest micro-needle stitches representing chinars, paisleys and saffron blossoms.',
                'verification_status' => 'verified',
                'rating_avg' => 4.90,
                'rating_count' => 20,
                'completed_orders' => 32,
                'total_sales' => 220000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Abdul Wahab',
                'business_name' => 'Hala Glazed Terracotta Works',
                'slug' => 'hala-glazed-terracotta',
                'city' => 'Hala',
                'region' => 'Sindh',
                'craft' => 'Traditional Sindhi Clay Water Matkas & Hand-painted Bowls',
                'bio' => 'Natural terracotta keeping water chilled naturally with traditional white floral slips.',
                'verification_status' => 'verified',
                'rating_avg' => 4.76,
                'rating_count' => 13,
                'completed_orders' => 25,
                'total_sales' => 62000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Shazia Parveen',
                'business_name' => 'Sindhi Ralli & Mirrorwork',
                'slug' => 'sindhi-ralli-mirrorwork',
                'city' => 'Hyderabad',
                'region' => 'Sindh',
                'craft' => 'Shisha (Mirror) Stitched Cushion Covers & Wall Décor',
                'bio' => 'Centuries-old needlecraft reflecting ambient light with hand-cut mirrors and vibrant threadwork.',
                'verification_status' => 'verified',
                'rating_avg' => 4.83,
                'rating_count' => 16,
                'completed_orders' => 27,
                'total_sales' => 91000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Ustad Qadir Bux',
                'business_name' => 'Chiniot Carved Furniture House',
                'slug' => 'chiniot-carved-furniture',
                'city' => 'Chiniot',
                'region' => 'Punjab',
                'craft' => 'Hand-carved Rosewood Jharokas & Mirror Frames',
                'bio' => 'Master woodcarvers shaping seasoned Dalbergia Sissoo into heritage archways and decorative trays.',
                'verification_status' => 'verified',
                'rating_avg' => 4.86,
                'rating_count' => 25,
                'completed_orders' => 38,
                'total_sales' => 275000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Sohail Tanveer',
                'business_name' => 'Peshawar Leather Chappal Store',
                'slug' => 'peshawar-leather-chappal-store',
                'city' => 'Peshawar',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Double Sole Kaptaan & Zalmi Cut Peshawari Sandals',
                'bio' => 'Double-stitched thick leather soles with soft goatskin footbeds for comfort and durability.',
                'verification_status' => 'verified',
                'rating_avg' => 4.79,
                'rating_count' => 19,
                'completed_orders' => 34,
                'total_sales' => 118000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Maliha Rehman',
                'business_name' => 'Resham & Rang Handlooms',
                'slug' => 'resham-rang-handlooms',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Pure Raw Silk Dupattas & Organza Embroidered Shawls',
                'bio' => 'Slow woven silks with traditional gota patti borders for festive occasions.',
                'verification_status' => 'verified',
                'rating_avg' => 4.84,
                'rating_count' => 23,
                'completed_orders' => 36,
                'total_sales' => 180000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Kareem Dad Baloch',
                'business_name' => 'Makran Tribal Crafts',
                'slug' => 'makran-tribal-crafts',
                'city' => 'Quetta',
                'region' => 'Balochistan',
                'craft' => 'Palm Leaf Handwoven Baskets & Tribal Leather Pouch Bags',
                'bio' => 'Indigenous woven date palm fronds and camel leather pouches crafted by nomadic artisans.',
                'verification_status' => 'verified',
                'rating_avg' => 4.73,
                'rating_count' => 10,
                'completed_orders' => 16,
                'total_sales' => 45000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Samina Tahir',
                'business_name' => 'Lahore Zardozi Studio',
                'slug' => 'lahore-zardozi-studio',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Gold Wire Zardozi Bridal Potlis & Velvet Nikahnama Folders',
                'bio' => 'Royal Mughal zari and dabka embroidery on pure velvet for wedding memories.',
                'verification_status' => 'verified',
                'rating_avg' => 4.87,
                'rating_count' => 22,
                'completed_orders' => 35,
                'total_sales' => 165000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Bilal Hassan',
                'business_name' => 'Taxila Stone Carving Workshop',
                'slug' => 'taxila-stone-carving',
                'city' => 'Rawalpindi',
                'region' => 'Punjab',
                'craft' => 'Gandhara Grey Schist Carvings & Natural Marble Pestles',
                'bio' => 'Preserving 2,000-year-old Taxila stone masonry techniques in natural granite and black schist.',
                'verification_status' => 'verified',
                'rating_avg' => 4.82,
                'rating_count' => 14,
                'completed_orders' => 20,
                'total_sales' => 89000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Zahra Batool',
                'business_name' => 'Chamak Kundan Jewelry',
                'slug' => 'chamak-kundan-jewelry',
                'city' => 'Karachi',
                'region' => 'Sindh',
                'craft' => 'Traditional Kundan Meenakari Jhumkas & Chokers',
                'bio' => 'Enamel painted reverse side and foil-backed glass stones set in 24k gold-plated brass.',
                'verification_status' => 'verified',
                'rating_avg' => 4.81,
                'rating_count' => 18,
                'completed_orders' => 31,
                'total_sales' => 135000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Waqas Ahmed',
                'business_name' => 'Woven Roots Jute & Leather',
                'slug' => 'woven-roots-jute-leather',
                'city' => 'Multan',
                'region' => 'Punjab',
                'craft' => 'Eco-friendly Golden Jute Totes & Leather Handles',
                'bio' => 'Zero-plastic sustainable artisan market bags with natural vegetable-tanned straps.',
                'verification_status' => 'verified',
                'rating_avg' => 4.75,
                'rating_count' => 11,
                'completed_orders' => 18,
                'total_sales' => 54000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Humaira Asif',
                'business_name' => 'Kaghaz & Rang Calligraphy',
                'slug' => 'kaghaz-rang-calligraphy',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Handmade Wasli Paper Arabic Calligraphy & Gold Leaf Illumination',
                'bio' => 'Traditional reed pen Qalam calligraphy on multi-layered wheat paste wasli paper.',
                'verification_status' => 'verified',
                'rating_avg' => 4.89,
                'rating_count' => 16,
                'completed_orders' => 24,
                'total_sales' => 98000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Sikandar Khan',
                'business_name' => 'Swat Artisan Wood Carvers',
                'slug' => 'swat-artisan-wood-carvers',
                'city' => 'Swat',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Walnut Wood Carved Bookstands (Rehal) & Keepsake Boxes',
                'bio' => 'Carved from seasoned Swati walnut trees with traditional geometric diamond reliefs.',
                'verification_status' => 'verified',
                'rating_avg' => 4.85,
                'rating_count' => 15,
                'completed_orders' => 26,
                'total_sales' => 112000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Tahira Jabeen',
                'business_name' => 'Heritage Hands Crochet Crafts',
                'slug' => 'heritage-hands-crochet',
                'city' => 'Islamabad',
                'region' => 'Federal',
                'craft' => 'Handmade Crochet Flower Bouquets & Decorative Coasters',
                'bio' => 'Everlasting yarn blossoms handmade with organic combed cotton yarn.',
                'verification_status' => 'verified',
                'rating_avg' => 4.78,
                'rating_count' => 12,
                'completed_orders' => 17,
                'total_sales' => 48000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Ustad Munir Kashigar',
                'business_name' => 'Mitti Studio Terracotta',
                'slug' => 'mitti-studio-terracotta',
                'city' => 'Multan',
                'region' => 'Punjab',
                'craft' => 'Clay Handi Cooking Pots & Tea Kullar Cups',
                'bio' => 'Pure unglazed river clay kitchenware adding authentic earthy aroma to desi cuisine.',
                'verification_status' => 'verified',
                'rating_avg' => 4.79,
                'rating_count' => 14,
                'completed_orders' => 23,
                'total_sales' => 52000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Mehmood Akhtar',
                'business_name' => 'Kashmir Craft Corner',
                'slug' => 'kashmir-craft-corner',
                'city' => 'Rawalpindi',
                'region' => 'Punjab',
                'craft' => 'Paper Mache Trinket Boxes & Hand-embroidered Pashminas',
                'bio' => 'Layered pulp paper mache decorated with miniature Persian bird-and-flower patterns.',
                'verification_status' => 'verified',
                'rating_avg' => 4.84,
                'rating_count' => 17,
                'completed_orders' => 29,
                'total_sales' => 138000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Saima Noor',
                'business_name' => 'Noor Threads Shadow Work',
                'slug' => 'noor-threads-shadow-work',
                'city' => 'Bahawalpur',
                'region' => 'Punjab',
                'craft' => 'Bahawalpuri Shadow Work & White-on-White Embroidery',
                'bio' => 'Delicate reverse herringbone stitches creating opaque shadows through sheer lawn.',
                'verification_status' => 'verified',
                'rating_avg' => 4.80,
                'rating_count' => 13,
                'completed_orders' => 21,
                'total_sales' => 79000.00,
                'is_new' => false,
            ],
            [
                'name' => 'Rashid Mehmood',
                'business_name' => 'Karigar Collective Metalcraft',
                'slug' => 'karigar-collective-metalcraft',
                'city' => 'Peshawar',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Brass Spice Boxes, Tea Infusers & Filigree Coasters',
                'bio' => 'Copper and brass kitchen crafts made with traditional hand-riveting methods.',
                'verification_status' => 'verified',
                'rating_avg' => 4.76,
                'rating_count' => 11,
                'completed_orders' => 16,
                'total_sales' => 61000.00,
                'is_new' => false,
            ],

            // NEW MAKERS (Recently onboarded, eligible for New Seller Boost, 0-2 orders, fresh dates)
            [
                'name' => 'Areeba Tariq',
                'business_name' => 'Hunar-e-Resin Custom Keepsakes',
                'slug' => 'hunar-e-resin-custom',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Customized Resin Door Nameplates & Floral Coasters',
                'bio' => 'Preserving local wild botanicals inside glass-clear epoxy resin, personalized with Arabic and Urdu calligraphy.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 1,
                'completed_orders' => 1,
                'total_sales' => 4500.00,
                'is_new' => true,
            ],
            [
                'name' => 'Hamza Saeed',
                'business_name' => 'Peshawar Leather Lab',
                'slug' => 'peshawar-leather-lab',
                'city' => 'Peshawar',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Minimalist Horween Style Leather Card Holders & Key fobs',
                'bio' => 'Modern ergonomic EDC goods made from vegetable-tanned cowhide with bevelled wax edges.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 2,
                'completed_orders' => 2,
                'total_sales' => 6200.00,
                'is_new' => true,
            ],
            [
                'name' => 'Naveed Akhtar',
                'business_name' => 'Mitti & Clay Contemporary Pottery',
                'slug' => 'mitti-clay-contemporary',
                'city' => 'Islamabad',
                'region' => 'Federal',
                'craft' => 'Matte Glazed Ceramic Espresso Mugs & Minimalist Vases',
                'bio' => 'Studio potter hand-throwing functional stoneware fired at 1220°C for daily coffee moments.',
                'verification_status' => 'verified',
                'rating_avg' => 5.00,
                'rating_count' => 1,
                'completed_orders' => 1,
                'total_sales' => 3800.00,
                'is_new' => true,
            ],
            [
                'name' => 'Sadia Khurram',
                'business_name' => 'Rang-e-Hunar Studio',
                'slug' => 'rang-e-hunar-studio',
                'city' => 'Karachi',
                'region' => 'Sindh',
                'craft' => 'Hand-painted Truck Art Wall Plates & Enamel Kettles',
                'bio' => 'Folk pop art celebrating Pakistani highway poetry on vibrant yellow, pink, and turquoise enamel.',
                'verification_status' => 'verified',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Imranullah Khan',
                'business_name' => 'Swat Handloom Wool Weaves',
                'slug' => 'swat-handloom-wool-weaves',
                'city' => 'Swat',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Warm Indigenous Sheep Wool Winter Chaddars',
                'bio' => 'Pure natural untreated sheep wool handloomed in the higher valleys of Swat.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Khadija Bibi',
                'business_name' => 'Dastkari Studio Balochi Crafts',
                'slug' => 'dastkari-studio-balochi',
                'city' => 'Quetta',
                'region' => 'Balochistan',
                'craft' => 'Traditional Balochi Leather Clutch Bags & Keyrings',
                'bio' => 'Handmade leather accessories accented with hand-embroidered tribal mirror patches.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 1,
                'completed_orders' => 1,
                'total_sales' => 2900.00,
                'is_new' => true,
            ],
            [
                'name' => 'Zeeshan Rosewood',
                'business_name' => 'Hunar-e-Wood Chiniot',
                'slug' => 'hunar-e-wood-chiniot',
                'city' => 'Chiniot',
                'region' => 'Punjab',
                'craft' => 'Geometric Walnut Coasters & Sheesham Serving Platters',
                'bio' => 'Hand-turned wooden tableware finished with food-safe natural walnut oil.',
                'verification_status' => 'verified',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Mahnoor Asad',
                'business_name' => 'Khushboo Crafts & Candle Studio',
                'slug' => 'khushboo-crafts-candle',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Hand-poured Soy Candles in Handcrafted Multani Terracotta Jars',
                'bio' => 'Infused with indigenous Pakistani scents: Motia, Raat ki Rani, and Sandalwood.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 1,
                'completed_orders' => 1,
                'total_sales' => 3200.00,
                'is_new' => true,
            ],
            [
                'name' => 'Junaid & Sana',
                'business_name' => 'Mitti Studio Ceramic Decor',
                'slug' => 'mitti-studio-ceramic-decor',
                'city' => 'Multan',
                'region' => 'Punjab',
                'craft' => 'Multani Blue Ceramic Candle Holders & Incense Burners',
                'bio' => 'Contemporary interpretations of 12th century Kashikari patterns for minimalist homes.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Farhan Shah',
                'business_name' => 'Hala Artisan Clay Potters',
                'slug' => 'hala-artisan-clay-potters',
                'city' => 'Hala',
                'region' => 'Sindh',
                'craft' => 'Hand-painted Sindhi Glazed Dessert Bowls',
                'bio' => 'Spotted floral patterns on yellow and turquoise lead-free clay glaze.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Ayesha Craft Guild',
                'business_name' => 'Woven Dreams Macramé & Crochet',
                'slug' => 'woven-dreams-macrame',
                'city' => 'Islamabad',
                'region' => 'Federal',
                'craft' => 'Boho Macramé Wall Hangings & Handwoven Plant Hangers',
                'bio' => '100% natural unbleached Pakistani cotton cord knotted into modern home statements.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Danyal Babar',
                'business_name' => 'Peshawar Craft House Brass',
                'slug' => 'peshawar-craft-house-brass',
                'city' => 'Peshawar',
                'region' => 'Khyber Pakhtunkhwa',
                'craft' => 'Hand-carved Pure Brass Incense Burners (Dhoop Daani)',
                'bio' => 'Traditional Khyber metalcraft with openwork filigree lids for slow aromatic resin burning.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 1,
                'completed_orders' => 1,
                'total_sales' => 2400.00,
                'is_new' => true,
            ],
            [
                'name' => 'Sidra Batool',
                'business_name' => 'Kashmir Threads Pashmina Art',
                'slug' => 'kashmir-threads-pashmina',
                'city' => 'Rawalpindi',
                'region' => 'Punjab',
                'craft' => 'Handloom Cashmere Stoles with Minimalist Zari Borders',
                'bio' => 'Feather-light mountain cashmere for modern formalwear.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
            [
                'name' => 'Waleed Raza',
                'business_name' => 'Lahore Handmade Studio',
                'slug' => 'lahore-handmade-studio',
                'city' => 'Lahore',
                'region' => 'Punjab',
                'craft' => 'Laser & Hand-engraved Sheesham Coasters & Desk Organizers',
                'bio' => 'Contemporary laser-cut Islamic geometric patterns in solid rosewood.',
                'verification_status' => 'basic',
                'rating_avg' => 5.00,
                'rating_count' => 0,
                'completed_orders' => 0,
                'total_sales' => 0.00,
                'is_new' => true,
            ],
        ];

        $sellers = [];

        foreach ($makerTemplates as $tpl) {
            $user = User::firstOrCreate(
                ['email' => $tpl['slug'] . '@dastkarhub.pk'],
                [
                    'name' => $tpl['name'],
                    'role' => 'seller',
                    'phone' => '+923' . rand(10, 49) . rand(1000000, 9999999),
                    'password' => Hash::make('password123'),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            // New maker boost dates configuration
            $boostStarted = null;
            $boostEnds = null;
            $onboardedAt = null;

            if ($tpl['is_new']) {
                $daysAgo = rand(1, 5);
                $boostStarted = Carbon::now()->subDays($daysAgo);
                $boostEnds = $boostStarted->copy()->addDays((int) config('discovery.new_seller_boost.duration_days', 30));
                $onboardedAt = $boostStarted;
            } else {
                $onboardedAt = Carbon::now()->subMonths(rand(3, 14));
            }

            $craftImages = [
                'hunar-e-resin-custom' => [
                    'cover' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'peshawar-leather-lab' => [
                    'cover' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'mitti-clay-contemporary' => [
                    'cover' => 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'rang-e-hunar-studio' => [
                    'cover' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'swat-handloom-wool-weaves' => [
                    'cover' => 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'dastkari-studio-balochi' => [
                    'cover' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'hunar-e-wood-chiniot' => [
                    'cover' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'khushboo-crafts-candle' => [
                    'cover' => 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'mitti-studio-ceramic-decor' => [
                    'cover' => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'hala-artisan-clay-potters' => [
                    'cover' => 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'woven-dreams-macrame' => [
                    'cover' => 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'peshawar-craft-house-brass' => [
                    'cover' => 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'kashmir-threads-pashmina' => [
                    'cover' => 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
                'lahore-handmade-studio' => [
                    'cover' => 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
                    'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=face&w=400&h=400&q=80',
                ],
            ];

            $artisanCover = $craftImages[$tpl['slug']]['cover'] ?? 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80';
            $artisanAvatar = $craftImages[$tpl['slug']]['avatar'] ?? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=face&w=400&h=400&q=80';

            $seller = SellerProfile::where('slug', $tpl['slug'])->first();
            if ($seller) {
                $seller->update([
                    'business_name' => $tpl['business_name'],
                    'bio' => $tpl['bio'],
                    'craft_description' => $tpl['craft'],
                    'location_city' => $tpl['city'],
                    'location_region' => $tpl['region'],
                    'verification_status' => $tpl['verification_status'],
                    'seller_status' => 'active',
                    'rating_average' => $tpl['rating_avg'],
                    'rating_count' => $tpl['rating_count'],
                    'completed_orders' => $tpl['completed_orders'],
                    'total_sales' => $tpl['total_sales'],
                    'avatar_url' => $artisanAvatar,
                    'cover_url' => $artisanCover,
                    'is_seeded' => true,
                    'new_seller_boost_started_at' => $boostStarted,
                    'new_seller_boost_ends_at' => $boostEnds,
                    'onboarding_completed_at' => $onboardedAt,
                    'response_time_minutes' => rand(15, 60),
                    'on_time_delivery_rate' => rand(96, 99) + (rand(0, 9) / 10),
                    'cancellation_rate' => rand(0, 2) + (rand(0, 5) / 10),
                ]);
            } else {
                $seller = SellerProfile::create([
                    'user_id' => $user->id,
                    'business_name' => $tpl['business_name'],
                    'slug' => $tpl['slug'],
                    'bio' => $tpl['bio'],
                    'craft_description' => $tpl['craft'],
                    'location_city' => $tpl['city'],
                    'location_region' => $tpl['region'],
                    'verification_status' => $tpl['verification_status'],
                    'seller_status' => 'active',
                    'rating_average' => $tpl['rating_avg'],
                    'rating_count' => $tpl['rating_count'],
                    'completed_orders' => $tpl['completed_orders'],
                    'total_sales' => $tpl['total_sales'],
                    'avatar_url' => $artisanAvatar,
                    'cover_url' => $artisanCover,
                    'is_seeded' => true,
                    'new_seller_boost_started_at' => $boostStarted,
                    'new_seller_boost_ends_at' => $boostEnds,
                    'onboarding_completed_at' => $onboardedAt,
                    'response_time_minutes' => rand(15, 60),
                    'on_time_delivery_rate' => rand(96, 99) + (rand(0, 9) / 10),
                    'cancellation_rate' => rand(0, 2) + (rand(0, 5) / 10),
                ]);
            }

            $sellers[] = $seller;
        }

        return $sellers;
    }

    private function seedBuyers(): array
    {
        $buyersData = [
            ['name' => 'Ayesha Siddiqui', 'email' => 'ayesha.buyer@dastkarhub.pk', 'city' => 'Karachi', 'phone' => '+923014443322'],
            ['name' => 'Bilal Farooq', 'email' => 'bilal.farooq@dastkarhub.pk', 'city' => 'Lahore', 'phone' => '+923215556677'],
            ['name' => 'Zainab Qureshi', 'email' => 'zainab.q@dastkarhub.pk', 'city' => 'Islamabad', 'phone' => '+923338889900'],
            ['name' => 'Hamza Tariq', 'email' => 'hamza.t@dastkarhub.pk', 'city' => 'Rawalpindi', 'phone' => '+923451112233'],
            ['name' => 'Fatima Noor', 'email' => 'fatima.noor@dastkarhub.pk', 'city' => 'Peshawar', 'phone' => '+923129998877'],
            ['name' => 'Usman Ghani', 'email' => 'usman.ghani@dastkarhub.pk', 'city' => 'Multan', 'phone' => '+923007776655'],
        ];

        $buyers = [];
        foreach ($buyersData as $bd) {
            $user = User::firstOrCreate(
                ['email' => $bd['email']],
                [
                    'name' => $bd['name'],
                    'role' => 'buyer',
                    'phone' => $bd['phone'],
                    'password' => Hash::make('password123'),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            Address::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $bd['name'],
                    'phone' => $bd['phone'],
                    'address_line1' => 'House ' . rand(1, 100) . ', Street ' . rand(1, 20) . ', Phase ' . rand(1, 6),
                    'city' => $bd['city'],
                    'state_province' => 'Pakistan',
                    'postal_code' => '44000',
                    'country' => 'Pakistan',
                    'is_default' => true,
                ]
            );

            $buyers[] = $user;
        }

        return $buyers;
    }

    private function seedProducts(array $categoriesMap, array $makers): array
    {
        $allProducts = [];
        $skuCounter = 1000;

        // Comprehensive catalog templates per major category (20-22 products each)
        $catalogTemplates = [
            'jewelry-accessories' => [
                ['title' => 'Traditional Multani Meenakari Jhumkas', 'price' => 3850, 'img' => 'jewelry', 'mat' => '24K Gold-Plated Brass, Enamel Meena, Pearls', 'dim' => '6.5 cm drop', 'custom' => false],
                ['title' => 'Handmade Silver Kundan Bridal Choker', 'price' => 7400, 'img' => 'jewelry', 'mat' => '925 Sterling Silver, Polki Glass, Emerald Beads', 'dim' => 'Adjustable Dori 14-18 in', 'custom' => false],
                ['title' => 'Karakoram Lapis Lazuli Sterling Silver Ring', 'price' => 2950, 'img' => 'jewelry', 'mat' => 'Natural Shigar Lapis Lazuli, Pure Silver', 'dim' => 'Sizes 14-22', 'custom' => true],
                ['title' => 'Balochi Tribal Brass Cuff Bracelet', 'price' => 2200, 'img' => 'jewelry', 'mat' => 'Hand-hammered Raw Brass, Turquoise Stone', 'dim' => 'Adjustable open cuff', 'custom' => false],
                ['title' => 'Handmade Kashmiri Pearl Mala Necklace', 'price' => 4500, 'img' => 'jewelry', 'mat' => 'Freshwater Cultured Pearls, Gold Thread Cord', 'dim' => '24 in length', 'custom' => false],
                ['title' => 'Vintage Filigree Chandbali Earrings', 'price' => 3200, 'img' => 'jewelry', 'mat' => 'Antique Finish Brass, Ghungroo Beads', 'dim' => '5 cm diameter', 'custom' => false],
                ['title' => 'Swati Turquoise Stone Studded Karra', 'price' => 2800, 'img' => 'jewelry', 'mat' => 'Silver Alloy, Mined Swat Turquoise', 'dim' => 'Diameter 2.6 in', 'custom' => false],
                ['title' => 'Handcrafted Ruby Red Teardrop Pendant', 'price' => 3100, 'img' => 'jewelry', 'mat' => 'Hydrothermal Red Spinel, Fine Silver Chain', 'dim' => '18 in chain', 'custom' => true],
                ['title' => 'Mughal Blossom Hair Pin & Brooch', 'price' => 1950, 'img' => 'jewelry', 'mat' => 'Enamel painted brass, Zircon crystals', 'dim' => '8 cm length', 'custom' => false],
                ['title' => 'Pakistani Bridal Matha Patti Headpiece', 'price' => 6800, 'img' => 'jewelry', 'mat' => 'Polki stones, Pearl hangings, Velvet backing', 'dim' => 'Adjustable crown fit', 'custom' => false],
                ['title' => 'Hand-carved Jade Stone Men Ring', 'price' => 3400, 'img' => 'jewelry', 'mat' => 'Natural Green Jade, Sterling Silver 925', 'dim' => 'US sizes 9-12', 'custom' => true],
                ['title' => 'Traditional Sindhi Hansli Collar Necklace', 'price' => 5200, 'img' => 'jewelry', 'mat' => 'Solid Brass, Red Cotton Thread Binding', 'dim' => 'One size collar', 'custom' => false],
                ['title' => 'Handmade Beaded Tassel Earrings', 'price' => 1450, 'img' => 'jewelry', 'mat' => 'Glass Seed Beads, Silk Threads', 'dim' => '7 cm drop', 'custom' => false],
                ['title' => 'Antique Gold Tone Payal Anklets (Pair)', 'price' => 2600, 'img' => 'jewelry', 'mat' => 'Brass alloy, Musical bell charms', 'dim' => '10 in with hook', 'custom' => false],
                ['title' => 'Custom Engraved Name Bar Necklace', 'price' => 2850, 'img' => 'jewelry', 'mat' => 'Stainless Steel with 18k Gold Dipping', 'dim' => '16-18 in adjustable', 'custom' => true],
                ['title' => 'Raw Tourmaline Healing Crystal Pendant', 'price' => 3900, 'img' => 'jewelry', 'mat' => 'Raw Gilgit Green Tourmaline, Silver Wire', 'dim' => '1.5 in stone drop', 'custom' => false],
                ['title' => 'Hand-threaded Garnet Bead Bracelet', 'price' => 2100, 'img' => 'jewelry', 'mat' => 'Natural Garnet Gemstones, Elastic cord', 'dim' => '7 in circumference', 'custom' => false],
                ['title' => 'Zari Embroidered Fabric Stud Earrings', 'price' => 1200, 'img' => 'jewelry', 'mat' => 'Silk velvet, Gold Zardozi, Surgical steel pin', 'dim' => '2 cm round', 'custom' => false],
                ['title' => 'Traditional Peshawari Coin Necklace', 'price' => 4200, 'img' => 'jewelry', 'mat' => 'Silvered Afghan coins, Black braided cord', 'dim' => '16 in collar', 'custom' => false],
                ['title' => 'Artisan Hand-wrapped Wire Cuff Ring', 'price' => 1650, 'img' => 'jewelry', 'mat' => 'Jewelers Brass, Moonstone cabochon', 'dim' => 'Adjustable wrap', 'custom' => true],
            ],
            'clothing-textiles' => [
                ['title' => 'Pure Sindhi Natural Indigo Ajrak Dupatta', 'price' => 4500, 'img' => 'textiles', 'mat' => '100% Handloom Cotton, Natural Plant Dye', 'dim' => '2.5 meters', 'custom' => false],
                ['title' => 'Hand-embroidered Bahawalpur Chikan Kurta', 'price' => 5800, 'img' => 'textiles', 'mat' => 'Pure Lawn Cotton, Resham Threadwork', 'dim' => 'Sizes S, M, L, XL', 'custom' => true],
                ['title' => 'Swati Woolen Handloom Men Chaddar', 'price' => 7200, 'img' => 'textiles', 'mat' => '100% Indigenous Swat Sheep Wool', 'dim' => '1.5 x 3 meters', 'custom' => false],
                ['title' => 'Multani Handspun Khaddar Unstitched Fabric', 'price' => 3800, 'img' => 'textiles', 'mat' => 'Organic Handspun Desi Cotton', 'dim' => '7 meters suit length', 'custom' => false],
                ['title' => 'Hala Block Printed Silk Festive Scarf', 'price' => 3400, 'img' => 'textiles', 'mat' => 'Pure Silk, Mineral Vegetable Dyes', 'dim' => '2 meters', 'custom' => false],
                ['title' => 'Balochi Tanka Tribal Embroidered Vest', 'price' => 6500, 'img' => 'textiles', 'mat' => 'Raw Silk, Wool Threads, Mirror Shisha', 'dim' => 'Chest 38-44 in', 'custom' => true],
                ['title' => 'Phulkari Floral Embroidered Stole', 'price' => 3600, 'img' => 'textiles', 'mat' => 'Georgette Silk, Multicolored Floss Silk', 'dim' => '2.25 meters', 'custom' => false],
                ['title' => 'Dera Ghazi Khan Chunri Tie & Dye Suit', 'price' => 4950, 'img' => 'textiles', 'mat' => 'Pure Chiffon, Hand-knotted Chunri', 'dim' => '3 Piece Unstitched', 'custom' => false],
                ['title' => 'Handwoven Pashmina Kashmiri Winter Shawl', 'price' => 12500, 'img' => 'textiles', 'mat' => 'Cashmere Wool, Needlework Border', 'dim' => '1 x 2 meters', 'custom' => false],
                ['title' => 'Traditional Sindhi Topi with Mirror Inset', 'price' => 1800, 'img' => 'textiles', 'mat' => 'Cotton Canvas, Golden Thread, Mirrors', 'dim' => 'Crown size 21-23 in', 'custom' => false],
                ['title' => 'Handloom Organic Cotton Kaftan Gown', 'price' => 5200, 'img' => 'textiles', 'mat' => 'Unbleached Handloom Cotton', 'dim' => 'Free Size Flowy', 'custom' => true],
                ['title' => 'Zardozi Hand-worked Velvet Dupatta', 'price' => 9500, 'img' => 'textiles', 'mat' => 'Micro Velvet, Dabka & Sitara Work', 'dim' => '2.5 meters', 'custom' => false],
                ['title' => 'Sindhi Hand-stitched Ralli Table Runner', 'price' => 2800, 'img' => 'textiles', 'mat' => 'Cotton Patchwork, Kantha Quilted', 'dim' => '14 x 72 in', 'custom' => false],
                ['title' => 'Block Printed Linen Summer Kurti', 'price' => 3950, 'img' => 'textiles', 'mat' => 'Organic Pure Linen, Teak Block Ink', 'dim' => 'Sizes S to XL', 'custom' => false],
                ['title' => 'Peshawari Khaddar Winter Waistcoat', 'price' => 4200, 'img' => 'textiles', 'mat' => 'Coarse Wool Khaddar, Antique Buttons', 'dim' => 'Sizes 38, 40, 42, 44', 'custom' => true],
                ['title' => 'Organza Gota Kinari Festive Dupatta', 'price' => 3800, 'img' => 'textiles', 'mat' => 'Korean Organza, Pure Silver Gota', 'dim' => '2.5 meters', 'custom' => false],
                ['title' => 'Hand-spun Wool Blanket with Tassels', 'price' => 8400, 'img' => 'textiles', 'mat' => 'Northern Sheep Wool, Hand-knotted Fringe', 'dim' => '60 x 90 in', 'custom' => false],
                ['title' => 'Indigo Dabu Mud Resist Printed Shirt', 'price' => 3600, 'img' => 'textiles', 'mat' => 'Handwoven Cambric Cotton', 'dim' => 'Sizes S to XXL', 'custom' => false],
                ['title' => 'Embroidered Kashmiri Wool Cape Shawl', 'price' => 8900, 'img' => 'textiles', 'mat' => 'Merino Wool, Aari Needle Embroidery', 'dim' => 'One Size Wrap', 'custom' => false],
                ['title' => 'Traditional Sindhi Suzani Wall Tapestry', 'price' => 6200, 'img' => 'textiles', 'mat' => 'Cotton Ground, Silk Chain Stitch', 'dim' => '40 x 60 in', 'custom' => false],
            ],
            'leather-crafts' => [
                ['title' => 'Authentic Kaptaan Peshawari Chappal', 'price' => 4200, 'img' => 'leather', 'mat' => 'Full-Grain Buffalo Leather, Tyre Sole', 'dim' => 'Sizes 39 to 45', 'custom' => true],
                ['title' => 'Hand-stitched Vegetable Tanned Bifold Wallet', 'price' => 2650, 'img' => 'leather', 'mat' => 'Italian Cowhide Leather, Waxed Linen Thread', 'dim' => '11 x 9 cm', 'custom' => true],
                ['title' => 'Traditional Zalmi Style Double Sole Sandal', 'price' => 4800, 'img' => 'leather', 'mat' => 'Mustard Finish Cowhide, Foam Cushioning', 'dim' => 'Sizes 40 to 45', 'custom' => false],
                ['title' => 'Rustic Leather Messenger Bag 15 Inch', 'price' => 9800, 'img' => 'leather', 'mat' => 'Crazy Horse Pull-up Leather, Solid Brass Buckles', 'dim' => '15 x 11 x 4 in', 'custom' => true],
                ['title' => 'Minimalist Leather Slim Card Holder', 'price' => 1450, 'img' => 'leather', 'mat' => 'Full-Grain Veg-Tan Leather', 'dim' => '10 x 7 cm', 'custom' => true],
                ['title' => 'Hand-burnished Heavy Duty Leather Belt', 'price' => 2400, 'img' => 'leather', 'mat' => 'Full-Grain 4mm Cowhide, Antique Brass Buckle', 'dim' => 'Sizes 30 to 44 in', 'custom' => true],
                ['title' => 'Handcrafted Leather Travel Passport Wallet', 'price' => 2850, 'img' => 'leather', 'mat' => 'Distressed Brown Leather, RFID Lining', 'dim' => '14 x 10 cm', 'custom' => true],
                ['title' => 'Traditional Tilla Embroidered Khussa Footwear', 'price' => 3400, 'img' => 'leather', 'mat' => 'Genuine Goatskin Leather, Golden Tilla Embroidery', 'dim' => 'Sizes 36 to 42', 'custom' => false],
                ['title' => 'Artisan Leather Tool Roll & Pen Case', 'price' => 2200, 'img' => 'leather', 'mat' => 'Oil Tanned Cow Leather, Suede Tie Strap', 'dim' => '12 x 8 in open', 'custom' => false],
                ['title' => 'Handmade Leather Laptop Sleeve 13/14 Inch', 'price' => 3800, 'img' => 'leather', 'mat' => 'Vegetable Tanned Leather, Wool Felt Lining', 'dim' => 'Custom tailored', 'custom' => true],
                ['title' => 'Vintage Doctor Bag Style Leather Satchel', 'price' => 11500, 'img' => 'leather', 'mat' => 'Full-Grain Steerhide, Iron Frame Closure', 'dim' => '14 x 10 x 6 in', 'custom' => false],
                ['title' => 'Hand-stitched Key Fob with Brass Clip', 'price' => 950, 'img' => 'leather', 'mat' => 'Veg-Tan Leather Scraps, Solid Brass Hardware', 'dim' => '12 cm total length', 'custom' => true],
                ['title' => 'Women Handcrafted Leather Tote Bag', 'price' => 7800, 'img' => 'leather', 'mat' => 'Soft Nappa Leather, Magnetic Closure', 'dim' => '14 x 12 x 5 in', 'custom' => true],
                ['title' => 'Men Hand-burnished Leather Money Clip', 'price' => 1650, 'img' => 'leather', 'mat' => 'Full-Grain Leather, Magnetic Clasp', 'dim' => '8 x 4 cm', 'custom' => true],
                ['title' => 'Balochi Embroidered Leather Slip-on Shoes', 'price' => 4500, 'img' => 'leather', 'mat' => 'Hand-dyed Leather, Silk Needlework', 'dim' => 'Sizes 39 to 44', 'custom' => false],
                ['title' => 'Handcrafted Desk Mousepad in Saddle Leather', 'price' => 1950, 'img' => 'leather', 'mat' => 'Thick Saddle Leather, Burnished Edges', 'dim' => '24 x 20 cm', 'custom' => true],
                ['title' => 'Leather Wrapped Stainless Steel Flask', 'price' => 2100, 'img' => 'leather', 'mat' => 'Food Grade Steel, Hand-stitched Leather Sleeve', 'dim' => '8 oz capacity', 'custom' => true],
                ['title' => 'Handmade Leather Watch Strap 20/22mm', 'price' => 1800, 'img' => 'leather', 'mat' => 'Horween Style Pull-up Leather', 'dim' => '20mm & 22mm widths', 'custom' => true],
                ['title' => 'Handmade Coaster Set in Saddle Leather (Set of 4)', 'price' => 1600, 'img' => 'leather', 'mat' => 'Heavy Veg-Tan Leather, Water resistant wax', 'dim' => '10 cm diameter', 'custom' => false],
                ['title' => 'Artisan Leather Duffle Bag Weekend Explorer', 'price' => 13500, 'img' => 'leather', 'mat' => 'Top Grain Cowhide, YKK Heavy Zippers', 'dim' => '20 x 11 x 10 in', 'custom' => true],
            ],
            'pottery-ceramics' => [
                ['title' => 'Multani Cobalt Blue Kashikari Vase 12 Inch', 'price' => 4800, 'img' => 'pottery', 'mat' => 'Natural White Silt Clay, Cobalt Oxide Glaze', 'dim' => '12 x 5 in', 'custom' => false],
                ['title' => 'Hand-painted Blue Pottery Serving Bowl Set', 'price' => 3800, 'img' => 'pottery', 'mat' => 'High-Fired Ceramic, Food-Safe Glaze', 'dim' => '8 in diameter (Set of 2)', 'custom' => false],
                ['title' => 'Traditional Sindhi Clay Water Matka with Lid', 'price' => 1650, 'img' => 'pottery', 'mat' => 'Natural Terracotta Clay, White Slips', 'dim' => '8 Liters capacity', 'custom' => false],
                ['title' => 'Kashikari Glazed Ceramic Coffee Mugs (Set of 2)', 'price' => 2200, 'img' => 'pottery', 'mat' => 'Ceramic Stoneware, Microwave Safe Glaze', 'dim' => '350 ml each', 'custom' => false],
                ['title' => 'Hala Glazed Hand-turned Dinner Plate Set', 'price' => 4500, 'img' => 'pottery', 'mat' => 'Sindh River Clay, Turmeric & Turquoise Glaze', 'dim' => '10 in (Set of 4)', 'custom' => false],
                ['title' => 'Multani Hand-painted Floral Decorative Wall Plate', 'price' => 2800, 'img' => 'pottery', 'mat' => 'Glazed Terracotta, Built-in Wall Hook', 'dim' => '10 in diameter', 'custom' => false],
                ['title' => 'Natural Clay Handi with Steam Lid for Desi Cooking', 'price' => 1950, 'img' => 'pottery', 'mat' => 'Unglazed Organic River Clay', 'dim' => '2.5 Liters volume', 'custom' => false],
                ['title' => 'Artisan Ceramic Teapot with Bamboo Handle', 'price' => 3600, 'img' => 'pottery', 'mat' => 'Stoneware, Hand-shaped Natural Bamboo', 'dim' => '800 ml capacity', 'custom' => false],
                ['title' => 'Terracotta Bonsai & Succulent Planter Pots', 'price' => 1400, 'img' => 'pottery', 'mat' => 'Porous Red Terracotta with Drainage Hole', 'dim' => '5 in (Set of 3)', 'custom' => false],
                ['title' => 'Hand-turned Ceramic Soap Dish & Tumbler Set', 'price' => 1750, 'img' => 'pottery', 'mat' => 'Ceramic Stoneware with Mottled Grey Glaze', 'dim' => 'Standard bath size', 'custom' => false],
                ['title' => 'Multani Blue Ceramic Oil & Vinegar Dispenser', 'price' => 2400, 'img' => 'pottery', 'mat' => 'Ceramic, Cork Stopper with Brass Spout', 'dim' => '500 ml each', 'custom' => false],
                ['title' => 'Traditional Desi Chai Kullar Cups (Set of 6)', 'price' => 1200, 'img' => 'pottery', 'mat' => 'Pure Earthenware Clay, Single Fired', 'dim' => '150 ml cups', 'custom' => false],
                ['title' => 'Handmade Ceramic Candle Jar with Brass Lid', 'price' => 2100, 'img' => 'pottery', 'mat' => 'Glazed Pottery Container, Soy Wax Motia', 'dim' => '300 grams wax', 'custom' => true],
                ['title' => 'Ceramic Serving Platter with Turquoise Lotus Motif', 'price' => 3200, 'img' => 'pottery', 'mat' => 'Oven Safe Stoneware Glaze', 'dim' => '14 x 8 in oval', 'custom' => false],
                ['title' => 'Contemporary Matte Black Ceramic Vase', 'price' => 2950, 'img' => 'pottery', 'mat' => 'Raw Texture Stoneware, Waterproof Interior', 'dim' => '9 x 4 in', 'custom' => false],
                ['title' => 'Multani Blue Pottery Coaster Tiles (Set of 6)', 'price' => 1800, 'img' => 'pottery', 'mat' => 'Ceramic Glazed Tile, Cork Backing', 'dim' => '4 x 4 in each', 'custom' => false],
                ['title' => 'Hala Geometric Decorative Tiles for Backsplash', 'price' => 4800, 'img' => 'pottery', 'mat' => 'Traditional Glazed Tiles', 'dim' => '6 x 6 in (Box of 8)', 'custom' => false],
                ['title' => 'Hand-sculpted Ceramic Incense Stick Holder', 'price' => 950, 'img' => 'pottery', 'mat' => 'White Stoneware, Ash Catching Leaf Shape', 'dim' => '9 in length', 'custom' => false],
                ['title' => 'Clay Biryani Handi Sealed with Dough Ring', 'price' => 2300, 'img' => 'pottery', 'mat' => 'Organic Heat-Treated Terracotta', 'dim' => '3.5 Liters', 'custom' => false],
                ['title' => 'Hand-painted Ceramic Salt & Pepper Shakers', 'price' => 1350, 'img' => 'pottery', 'mat' => 'Multani Kashigar Pattern, Silicone Base Cap', 'dim' => '3.5 in height', 'custom' => false],
            ],
            'woodwork' => [
                ['title' => 'Royal Chinioti Sheesham Carved Serving Tray', 'price' => 3800, 'img' => 'woodwork', 'mat' => 'Solid Dalbergia Sissoo (Rosewood), Brass Handles', 'dim' => '18 x 12 in', 'custom' => true],
                ['title' => 'Handmade Brass Inlay Wooden Keepsake Box', 'price' => 2950, 'img' => 'woodwork', 'mat' => 'Seasoned Sheesham Wood, Pure Brass Filigree', 'dim' => '8 x 5 x 3 in', 'custom' => true],
                ['title' => 'Hand-carved Rehal Quran Book Stand in Walnut', 'price' => 3200, 'img' => 'woodwork', 'mat' => 'Solid Swati Walnut Wood, Folding Mechanism', 'dim' => '14 in height', 'custom' => false],
                ['title' => 'Chiniot Carved Octagonal Side Table', 'price' => 11500, 'img' => 'woodwork', 'mat' => 'Hand-carved Rosewood, Foldable Legs', 'dim' => '18 in high, 16 in top', 'custom' => false],
                ['title' => 'Handcrafted Sheesham Cutting Board with Juice Groove', 'price' => 2450, 'img' => 'woodwork', 'mat' => 'End-Grain Rosewood, Food-Safe Mineral Wax', 'dim' => '16 x 11 x 1.25 in', 'custom' => true],
                ['title' => 'Arabic Calligraphy Wooden Wall Clock', 'price' => 4500, 'img' => 'woodwork', 'mat' => 'Walnut Veneer, Silent Quartz Movement', 'dim' => '14 in diameter', 'custom' => false],
                ['title' => 'Hand-carved Jharoka Window Wall Mirror', 'price' => 6800, 'img' => 'woodwork', 'mat' => 'Aged Teak Wood, Antiqued Glass Mirror', 'dim' => '22 x 15 in', 'custom' => false],
                ['title' => 'Solid Sheesham Wooden Coaster Set with Stand', 'price' => 1650, 'img' => 'woodwork', 'mat' => 'Pure Rosewood, Brass Inset Stars (Set of 6)', 'dim' => '4 in diameter', 'custom' => false],
                ['title' => 'Handmade Wooden Spatula & Salad Server Set', 'price' => 1400, 'img' => 'woodwork', 'mat' => 'Hard Sheesham Wood, Hand-sanded Smooth', 'dim' => '12 in (Set of 3)', 'custom' => false],
                ['title' => 'Custom Engraved Wooden Wedding Memory Box', 'price' => 3600, 'img' => 'woodwork', 'mat' => 'Walnut Wood, Velvet Lined Interior', 'dim' => '10 x 8 x 4 in', 'custom' => true],
                ['title' => 'Chinioti Floral Carved Key Holder Rack', 'price' => 1850, 'img' => 'woodwork', 'mat' => 'Rosewood, 5 Antiqued Brass Hooks', 'dim' => '12 x 5 in', 'custom' => false],
                ['title' => 'Hand-turned Wooden Fruit Bowl in Rosewood', 'price' => 3400, 'img' => 'woodwork', 'mat' => 'Single Block Lathe-turned Sheesham', 'dim' => '10 in diameter', 'custom' => false],
                ['title' => 'Handcrafted Wooden Tissue Box Cover', 'price' => 2100, 'img' => 'woodwork', 'mat' => 'Brass Floral Inlay on Walnut Finish', 'dim' => 'Standard rectangular', 'custom' => false],
                ['title' => 'Rustic Wooden Wall Hanging Shelf with Rope', 'price' => 2600, 'img' => 'woodwork', 'mat' => 'Solid Pine Plank, Natural Jute Rope', 'dim' => '20 x 6 in', 'custom' => false],
                ['title' => 'Handmade Wooden Chess Set with Carved Pieces', 'price' => 7500, 'img' => 'woodwork', 'mat' => 'Sheesham & Boxwood, Inlaid Board', 'dim' => '14 x 14 in folding', 'custom' => false],
                ['title' => 'Wooden Mobile & Tablet Stand with Pen Slot', 'price' => 1250, 'img' => 'woodwork', 'mat' => 'Solid Sheesham, Natural Oil Polish', 'dim' => '6 x 4 in', 'custom' => true],
                ['title' => 'Carved Wooden Dry Fruit Box with Partitions', 'price' => 3950, 'img' => 'woodwork', 'mat' => '4 Partitioned Glass Top Rosewood Box', 'dim' => '10 x 10 in', 'custom' => false],
                ['title' => 'Handmade Wooden Masala Spice Box (9 Compartments)', 'price' => 3200, 'img' => 'woodwork', 'mat' => 'Natural Sheesham, Glass Top with Brass Latch', 'dim' => '9 x 9 in', 'custom' => false],
                ['title' => 'Hand-carved Islamic Ayatul Kursi Wall Plaque', 'price' => 5400, 'img' => 'woodwork', 'mat' => 'Bas-Relief Carving in Solid Teak Wood', 'dim' => '24 x 12 in', 'custom' => false],
                ['title' => 'Rosewood Rolling Pin & Roti Board (Chakla Belan)', 'price' => 2100, 'img' => 'woodwork', 'mat' => 'Heavy Seasoned Sheesham Wood', 'dim' => '11 in board, 14 in pin', 'custom' => false],
            ],
            'home-decor' => [
                ['title' => 'Multani Hand-painted Camel Skin Table Lamp', 'price' => 3600, 'img' => 'decor', 'mat' => 'Treated Camel Skin Membrane, Wooden Base, E27', 'dim' => '12 in height', 'custom' => false],
                ['title' => 'Pakistani Truck Art Hand-painted Metal Kettle', 'price' => 2450, 'img' => 'decor', 'mat' => 'Stainless Steel with Enamel Chamak Patti Paint', 'dim' => '1.5 Liters', 'custom' => false],
                ['title' => 'Beaten Pure Brass Moroccan Lantern with Glass', 'price' => 5800, 'img' => 'decor', 'mat' => 'Solid Brass Openwork, Amber Tinted Glass', 'dim' => '16 x 7 in', 'custom' => false],
                ['title' => 'Sindhi Handcrafted Shisha Mirror Wall Hanging', 'price' => 2800, 'img' => 'decor', 'mat' => 'Cotton Base, Hand-embroidered Mirrorwork', 'dim' => '12 x 36 in', 'custom' => false],
                ['title' => 'Natural White Onyx Stone Table Lamp', 'price' => 7200, 'img' => 'decor', 'mat' => 'Balochistan Natural Translucent Onyx Marble', 'dim' => '10 x 5 in cylinder', 'custom' => false],
                ['title' => 'Truck Art Hand-painted Steel Serving Tray', 'price' => 2100, 'img' => 'decor', 'mat' => 'Galvanized Steel, Waterproof Enamel Lacquer', 'dim' => '14 in round', 'custom' => false],
                ['title' => 'Hand-loomed Jute & Cotton Floor Rug (Chatai)', 'price' => 4500, 'img' => 'decor', 'mat' => 'Natural Golden Jute, Recycled Cotton Wefts', 'dim' => '3 x 5 ft', 'custom' => false],
                ['title' => 'Traditional Multani Blue Kashikari Wall Clock', 'price' => 3900, 'img' => 'decor', 'mat' => 'Glazed Ceramic Tile on Sheesham Frame', 'dim' => '12 in diameter', 'custom' => false],
                ['title' => 'Hand-carved Sheesham Wood Mirror with Brass Studs', 'price' => 4200, 'img' => 'decor', 'mat' => 'Rosewood, Hand-hammered Brass Rivets', 'dim' => '18 x 14 in', 'custom' => false],
                ['title' => 'Chamak Patti Truck Art Decorative Wall Frame', 'price' => 1950, 'img' => 'decor', 'mat' => 'Reflective Chamak Patti Film, Wooden Frame', 'dim' => '12 x 12 in', 'custom' => false],
                ['title' => 'Handmade Macramé Plant Hanger with Wooden Ring', 'price' => 1250, 'img' => 'decor', 'mat' => '100% Unbleached Cotton Cord', 'dim' => '38 in total drop', 'custom' => false],
                ['title' => 'Natural Himalayan Pink Salt Crystal Lamp with Dimmer', 'price' => 2200, 'img' => 'decor', 'mat' => 'Khewra Salt Mine Rock, Sheesham Wooden Base', 'dim' => '3-4 kg rock', 'custom' => false],
                ['title' => 'Handmade Balochi Embroidered Cushion Cover (Pair)', 'price' => 3200, 'img' => 'decor', 'mat' => 'Cotton Canvas, Needle Stitching, Hidden Zipper', 'dim' => '16 x 16 in (2 pcs)', 'custom' => false],
                ['title' => 'Vintage Pakistani Brass Incense Dhoop Burner', 'price' => 2650, 'img' => 'decor', 'mat' => 'Pure Brass, Perforated Filigree Lid', 'dim' => '6 in height', 'custom' => false],
                ['title' => 'Handmade Wool Kilim Geometric Cushion Cover', 'price' => 2400, 'img' => 'decor', 'mat' => 'Wool Kilim Weave Face, Cotton Back', 'dim' => '18 x 18 in', 'custom' => false],
                ['title' => 'Hand-painted Truck Art Steel Chai Cup & Saucer', 'price' => 1600, 'img' => 'decor', 'mat' => 'Food-grade Steel, Enamel Painted Rim', 'dim' => '250 ml capacity', 'custom' => false],
                ['title' => 'Brass Peacock Figurine for Tabletop Décor', 'price' => 3100, 'img' => 'decor', 'mat' => 'Solid Cast Brass with Engraved Plumage', 'dim' => '7 in height', 'custom' => false],
                ['title' => 'Handmade Paper Mache Decorative Bowl in Gold Leaf', 'price' => 1850, 'img' => 'decor', 'mat' => 'Kashmiri Paper Pulp, Lacquer Sealed Gold Leaf', 'dim' => '8 in diameter', 'custom' => false],
                ['title' => 'Sindhi Ajrak Motif Block-Printed Cushion Covers (Set of 2)', 'price' => 2100, 'img' => 'decor', 'mat' => 'Handloom Cotton, Natural Vegetable Print', 'dim' => '16 x 16 in', 'custom' => false],
                ['title' => 'Hand-hammered Copper Candle Sconces (Pair)', 'price' => 4800, 'img' => 'decor', 'mat' => 'Pure Copper with Antique Patina Finish', 'dim' => '12 in height (Pair)', 'custom' => false],
            ],
        ];

        // Ensure every category gets products by generating from catalog templates or category-specific mapping
        foreach ($categoriesMap as $catIndex => $categoryInfo) {
            $parentCat = $categoryInfo['parent'];
            $subcatIds = $categoryInfo['subcategories'];
            $slug = $parentCat->slug;

            // Pick appropriate template or fallback
            $templateKey = match ($slug) {
                'jewelry-accessories' => 'jewelry-accessories',
                'clothing-textiles', 'embroidery', 'crochet-knitting', 'shawls-scarves' => 'clothing-textiles',
                'leather-crafts', 'bags-wallets' => 'leather-crafts',
                'pottery-ceramics' => 'pottery-ceramics',
                'woodwork', 'home-kitchen-crafts' => 'woodwork',
                default => 'home-decor',
            };

            $baseTemplates = $catalogTemplates[$templateKey];

            // Generate 20-22 products for this category
            for ($i = 0; $i < 20; $i++) {
                $skuCounter++;
                $tpl = $baseTemplates[$i % count($baseTemplates)];

                // Assign to a maker (distributing across established, verified, and new makers)
                $assignedMaker = $makers[($catIndex * 3 + $i) % count($makers)];

                // Subcategory assignment
                $subcatId = !empty($subcatIds) ? $subcatIds[$i % count($subcatIds)] : $parentCat->id;

                // Price with slight variation
                $price = $tpl['price'] + (($i % 5) * 150) - (($i % 3) * 100);
                $compareAtPrice = ($i % 3 === 0) ? round($price * 1.30, -1) : null;

                // Title variation based on category and region
                $regionalPrefix = match ($i % 4) {
                    0 => 'Handcrafted ',
                    1 => 'Traditional ',
                    2 => 'Artisan ',
                    default => 'Authentic ',
                };

                $productTitle = $regionalPrefix . $tpl['title'] . ($catIndex > 5 ? ' - Edition ' . ($i + 1) : '');
                $productSlug = Str::slug($productTitle . '-' . $skuCounter);

                // Stock variation: realistic inventory (in stock, low stock, made to order, out of stock)
                $stockQuantity = match ($i % 10) {
                    9 => 0, // 10% Out of stock (tests Scenario 3)
                    8 => 1, // Low stock
                    7 => 2, // Low stock
                    default => rand(6, 24), // Healthy in-stock
                };

                $isCustomizable = (bool) ($tpl['custom'] || ($i % 4 === 0));
                $productionDays = $isCustomizable ? rand(3, 7) : rand(1, 3);

                // Rating & Review signals
                $ratingAvg = $assignedMaker->rating_average;
                $ratingCount = rand(3, 28);
                if ($assignedMaker->verification_status === 'basic' && $assignedMaker->is_seeded && $assignedMaker->new_seller_boost_started_at) {
                    $ratingCount = rand(0, 2);
                }

                // Strict object-aware craft image resolution
                [$primaryImg, $secondaryImgs] = $this->resolveCraftImagesForProduct($productTitle, $parentCat->slug, $i);

                // Rich artisan description
                $productDesc = "Handcrafted by artisans at {$assignedMaker->business_name} in {$assignedMaker->location_city}, {$assignedMaker->location_region}.\n\n"
                    . "Craft Specialty: {$assignedMaker->craft_description}.\n"
                    . "Materials & Construction: Made using {$tpl['mat']}. "
                    . "Every piece undergoes traditional hand-shaping, firing, or stitching passed down through generations.\n\n"
                    . "Dimensions & Fit: {$tpl['dim']}.\n"
                    . "Care Instructions: Clean gently with dry or slightly damp soft cloth. Keep away from harsh abrasive detergents.\n"
                    . "Handmade Heritage Note: Because each item is individually crafted by hand, slight natural variations in texture, glaze shade, or grain are hallmarks of authenticity.";

                $product = Product::updateOrCreate(
                    ['slug' => $productSlug],
                    [
                        'seller_id' => $assignedMaker->id,
                        'category_id' => $subcatId,
                        'title' => $productTitle,
                        'description' => $productDesc,
                        'base_price' => $price,
                        'compare_at_price' => $compareAtPrice,
                        'status' => 'published',
                        'stock_quantity' => $stockQuantity,
                        'production_days' => $productionDays,
                        'is_customizable' => $isCustomizable,
                        'materials' => $tpl['mat'],
                        'dimensions' => $tpl['dim'],
                        'care_instructions' => 'Gently wipe with dry cloth. Avoid prolonged moisture and abrasive chemicals.',
                        'weight_grams' => rand(200, 2500),
                        'rating_average' => $ratingAvg,
                        'rating_count' => $ratingCount,
                        'is_featured' => ($i % 7 === 0),
                        'is_seeded' => true,
                        'ranking_score' => 0.0000,
                        'impressions_count' => rand(15, 350),
                        'clicks_count' => rand(2, 60),
                        'wishlist_count' => rand(1, 20),
                        'sales_count' => rand(0, 15),
                        'published_at' => Carbon::now()->subDays(rand(1, 45)),
                    ]
                );

                // Primary Image - Always matched to product physical object
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'is_primary' => true],
                    [
                        'image_url' => $primaryImg,
                        'alt_text' => $productTitle . ' primary view',
                        'sort_order' => 1,
                    ]
                );

                // Clear any legacy broken images for this product
                ProductImage::where('product_id', $product->id)
                    ->where(function ($q) {
                        $q->where('image_url', 'like', '%1590483256037%')
                          ->orWhere('image_url', 'like', '%1611591475152%')
                          ->orWhere('image_url', 'like', '%1576020799627%');
                    })->delete();

                // Additional gallery images (2-3 gallery images per product)
                $sort = 2;
                foreach (array_slice($secondaryImgs, 0, 2) as $secImg) {
                    ProductImage::updateOrCreate(
                        ['product_id' => $product->id, 'sort_order' => $sort],
                        [
                            'image_url' => $secImg,
                            'alt_text' => $productTitle . ' detail view ' . $sort,
                            'is_primary' => false,
                        ]
                    );
                    $sort++;
                }

                // Add Customization Options if customizable
                if ($isCustomizable) {
                    CustomizationOption::firstOrCreate(
                        ['product_id' => $product->id, 'name' => 'Custom Name / Initials'],
                        [
                            'type' => 'text',
                            'price_delta' => 250.00,
                            'is_required' => false,
                        ]
                    );

                    CustomizationOption::firstOrCreate(
                        ['product_id' => $product->id, 'name' => 'Artisan Gift Packaging'],
                        [
                            'type' => 'select',
                            'options_json' => ['Standard Eco Box', 'Handloom Velvet Potli Wrap (+Rs. 350)'],
                            'price_delta' => 0.00,
                            'is_required' => false,
                        ]
                    );
                }

                // Add Variants on footwear, clothing, or jewelry
                if (str_contains($slug, 'leather') || str_contains($slug, 'clothing') || str_contains($slug, 'textiles')) {
                    $sizes = ['Small / 39', 'Medium / 41', 'Large / 43', 'XL / 45'];
                    foreach ($sizes as $idx => $sizeName) {
                        ProductVariant::firstOrCreate(
                            ['product_id' => $product->id, 'name' => $sizeName],
                            [
                                'sku' => 'SKU-' . $product->id . '-' . ($idx + 1),
                                'price' => $price,
                                'stock_quantity' => rand(2, 8),
                                'attributes_json' => ['size' => $sizeName],
                            ]
                        );
                    }
                }

                $allProducts[] = $product;
            }
        }

        // Rank and update initial ranking scores on all products using ProductRankingService
        $rankingService = app(\App\Services\Discovery\ProductRankingService::class);
        foreach ($allProducts as $p) {
            $analysis = $rankingService->calculateScore($p);
            $p->ranking_score = $analysis['score'];
            $p->last_ranked_at = Carbon::now();
            $p->save();
        }

        return $allProducts;
    }

    private function seedOrdersAndReviews(array $products, array $makers, array $buyers): void
    {
        $orderCounter = 2000;

        $reviewComments5Star = [
            'MashAllah the craftsmanship is truly exceptional! Exactly as described, packed with extreme care in Hala.',
            'Stunning Pakistani handmade treasure. The brass inlay work has such clean lines and generational elegance.',
            'Bought this as an anniversary gift and my family loved it. 100% authentic Multani blue pottery!',
            'The leather smells genuine and the hand-burnished edges feel so premium. Best Peshawari footwear in Pakistan.',
            'Pure Swati wool quality. Warm, breathable, and no middleman markup. Proud to support our local rural makers.',
            'The embroidery details are breathtaking. Even prettier in person than in the photos.',
        ];

        $reviewComments4Star = [
            'Very good quality and authentic artisan finish. Delivery took 4 days to Lahore but well worth the wait.',
            'Beautiful handmade piece. Slight natural variation in the terracotta glaze which confirms it is genuine handcraft.',
            'Lovely hand-stitched wallet. A bit stiff on day one but softened into a gorgeous patina within a week.',
            'Good packaging and authentic craft. Would definitely buy again from this maker guild.',
        ];

        $reviewComments3Star = [
            'Decent handcrafted quality, though color was slightly darker than pictured due to natural dye variations.',
            'Good product overall. Took 5 days to deliver via TCS, but the artisan was helpful over support chat.',
        ];

        // Seed 40 controlled demo orders and reviews
        for ($i = 0; $i < 40; $i++) {
            $orderCounter++;
            $buyer = $buyers[$i % count($buyers)];
            $product = $products[$i * 7 % count($products)];
            $seller = $product->seller;

            // Give more demo orders to established and verified makers
            if ($seller->verification_status === 'basic' && $seller->completed_orders < 1) {
                continue;
            }

            $quantity = rand(1, 2);
            $unitPrice = $product->base_price;
            $subtotal = $unitPrice * $quantity;
            $shipping = 250.00;
            $total = $subtotal + $shipping;

            $order = Order::firstOrCreate(
                ['order_number' => 'DK-DEMO-' . $orderCounter],
                [
                    'buyer_id' => $buyer->id,
                    'status' => 'delivered',
                    'subtotal' => $subtotal,
                    'shipping_fee' => $shipping,
                    'discount_amount' => 0.00,
                    'total_amount' => $total,
                    'currency' => 'PKR',
                    'shipping_address_snapshot' => [
                        'full_name' => $buyer->name,
                        'phone' => $buyer->phone,
                        'address_line1' => 'House 42-B, Clifton Block 4',
                        'city' => 'Karachi',
                        'country' => 'Pakistan',
                    ],
                    'shipping_method' => 'standard',
                    'payment_method' => ($i % 2 === 0) ? 'cod' : 'jazzcash_easypaisa',
                    'payment_status' => 'paid',
                    'notes' => 'Seeded demo marketplace order for ranking and analytics testing',
                    'is_seeded' => true,
                    'placed_at' => Carbon::now()->subDays(rand(5, 40)),
                    'delivered_at' => Carbon::now()->subDays(rand(1, 4)),
                ]
            );

            OrderItem::firstOrCreate(
                ['order_id' => $order->id, 'product_id' => $product->id],
                [
                    'seller_id' => $seller->id,
                    'product_title' => $product->title,
                    'product_image' => $product->primaryImage?->image_url,
                    'product_snapshot_json' => [
                        'title' => $product->title,
                        'price' => $unitPrice,
                        'materials' => $product->materials,
                    ],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'status' => 'delivered',
                    'is_seeded' => true,
                ]
            );

            // Realistic review distribution: 70% 5-star, 20% 4-star, 10% 3-star
            $rating = match ($i % 10) {
                9 => 3,
                7, 8 => 4,
                default => 5,
            };

            $commentPool = match ($rating) {
                3 => $reviewComments3Star,
                4 => $reviewComments4Star,
                default => $reviewComments5Star,
            };

            $comment = $commentPool[$i % count($commentPool)];

            Review::firstOrCreate(
                ['order_id' => $order->id, 'product_id' => $product->id],
                [
                    'buyer_id' => $buyer->id,
                    'seller_id' => $seller->id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'status' => 'published',
                    'is_seeded' => true,
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]
            );
        }
    }

    /**
     * Resolves high-resolution, verified craft image URLs strictly matching the product's physical object.
     */
    private function resolveCraftImagesForProduct(string $title, string $categorySlug, int $seedIndex): array
    {
        $t = strtolower($title);

        // 1. Ceramic & Tableware (Plate, Bowl, Vase, Mug/Cup, Pot/Handi, Teapot)
        if (str_contains($t, 'plate') || str_contains($t, 'thali') || str_contains($t, 'platter')) {
            $primaries = [
                'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'bowl') || str_contains($t, 'katori')) {
            $primaries = [
                'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'vase') || str_contains($t, 'surahi')) {
            $primaries = [
                'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'cup') || str_contains($t, 'mug') || str_contains($t, 'kullar') || str_contains($t, 'chai') || str_contains($t, 'shaker') || str_contains($t, 'dispenser')) {
            $primaries = [
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'matka') || str_contains($t, 'handi') || str_contains($t, 'pot') || str_contains($t, 'clay') || str_contains($t, 'planter') || str_contains($t, 'soap dish')) {
            $primaries = [
                'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'teapot') || str_contains($t, 'kettle')) {
            $primaries = [
                'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        // 2. Leather & Footwear (Chappal, Khussa, Wallet, Belt, Bag, Key Fob)
        if (str_contains($t, 'chappal') || str_contains($t, 'sandal') || str_contains($t, 'peshawari') || str_contains($t, 'zalmi')) {
            $primaries = [
                'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'khussa') || str_contains($t, 'shoe') || str_contains($t, 'footwear') || str_contains($t, 'slip-on')) {
            $primaries = [
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'wallet') || str_contains($t, 'card holder') || str_contains($t, 'money clip') || str_contains($t, 'passport')) {
            $primaries = [
                'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'belt')) {
            $primaries = [
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'bag') || str_contains($t, 'tote') || str_contains($t, 'satchel') || str_contains($t, 'duffle') || str_contains($t, 'sleeve') || str_contains($t, 'case') || str_contains($t, 'mousepad') || str_contains($t, 'flask') || str_contains($t, 'strap')) {
            $primaries = [
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'key') || str_contains($t, 'fob')) {
            return [
                'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80']
            ];
        }

        // 3. Jewelry & Adornments (Earrings, Necklace/Choker, Ring, Bracelet/Cuff)
        if (str_contains($t, 'earring') || str_contains($t, 'jhumka') || str_contains($t, 'chandbali') || str_contains($t, 'stud')) {
            $primaries = [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'necklace') || str_contains($t, 'choker') || str_contains($t, 'mala') || str_contains($t, 'pendant') || str_contains($t, 'hansli') || str_contains($t, 'matha patti') || str_contains($t, 'brooch') || str_contains($t, 'hair pin')) {
            $primaries = [
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'ring')) {
            $primaries = [
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'bracelet') || str_contains($t, 'cuff') || str_contains($t, 'karra') || str_contains($t, 'bangle') || str_contains($t, 'payal') || str_contains($t, 'anklet')) {
            $primaries = [
                'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        // 4. Woodwork (Tray, Box, Table, Board, Mirror, Clock, Chess)
        if (str_contains($t, 'tray')) {
            $primaries = [
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'box') || str_contains($t, 'casket') || str_contains($t, 'rehal') || str_contains($t, 'stand') || str_contains($t, 'rack') || str_contains($t, 'shelf')) {
            $primaries = [
                'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'table') || str_contains($t, 'stool')) {
            return [
                'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'board') || str_contains($t, 'belan') || str_contains($t, 'chakla') || str_contains($t, 'spatula')) {
            return [
                'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'mirror') || str_contains($t, 'jharoka')) {
            return [
                'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'clock')) {
            return [
                'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'chess')) {
            return [
                'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']
            ];
        }

        // 5. Textiles & Apparel (Ajrak, Shawl/Dupatta, Kurta/Vest, Cushion, Rug)
        if (str_contains($t, 'ajrak')) {
            return [
                'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'shawl') || str_contains($t, 'dupatta') || str_contains($t, 'chaddar') || str_contains($t, 'stole') || str_contains($t, 'pashmina')) {
            $primaries = [
                'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'kurta') || str_contains($t, 'vest') || str_contains($t, 'suit') || str_contains($t, 'shirt') || str_contains($t, 'kaftan') || str_contains($t, 'topi')) {
            $primaries = [
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
            ];
            $p = $primaries[$seedIndex % count($primaries)];
            return [$p, array_values(array_filter($primaries, fn($u) => $u !== $p))];
        }

        if (str_contains($t, 'cushion') || str_contains($t, 'pillow')) {
            return [
                'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'rug') || str_contains($t, 'carpet') || str_contains($t, 'chatai') || str_contains($t, 'floor')) {
            return [
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'fabric') || str_contains($t, 'khaddar') || str_contains($t, 'linen') || str_contains($t, 'silk')) {
            return [
                'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80']
            ];
        }

        // 6. Home Décor & Lighting (Lamp, Salt Lamp, Lantern, Candle, Brass, Painting)
        if (str_contains($t, 'salt lamp')) {
            return [
                'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'lamp')) {
            return [
                'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'lantern')) {
            return [
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'candle')) {
            return [
                'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'brass') || str_contains($t, 'incense') || str_contains($t, 'dhoop') || str_contains($t, 'burner') || str_contains($t, 'peacock')) {
            return [
                'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80']
            ];
        }

        if (str_contains($t, 'painting') || str_contains($t, 'truck art') || str_contains($t, 'art') || str_contains($t, 'frame') || str_contains($t, 'calligraphy')) {
            return [
                'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80']
            ];
        }

        // Generic fallback by category
        return match ($categorySlug) {
            'jewelry-accessories' => [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']
            ],
            'clothing-textiles', 'embroidery', 'crochet-knitting', 'shawls-scarves' => [
                'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80']
            ],
            'leather-crafts', 'bags-wallets' => [
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80']
            ],
            'woodwork', 'home-kitchen-crafts' => [
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80']
            ],
            default => [
                'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
                ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80']
            ],
        };
    }
}
