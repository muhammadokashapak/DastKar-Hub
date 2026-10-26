<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiListingService
{
    /**
     * Generate structured artisanal listing draft from seller notes/keywords.
     *
     * @param string $notes
     * @param int|null $categoryId
     * @return array
     */
    public function generateListing(string $notes, ?int $categoryId = null): array
    {
        $geminiKey = env('GEMINI_API_KEY') ?: config('services.gemini.key');

        if ($geminiKey) {
            try {
                $aiResult = $this->callGeminiApi($notes, $geminiKey, $categoryId);
                if ($aiResult) {
                    return $aiResult;
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini AI listing generation failed, falling back to heuristic engine: ' . $e->getMessage());
            }
        }

        return $this->generateHeuristicListing($notes, $categoryId);
    }

    /**
     * Call Google Gemini API for listing synthesis.
     */
    protected function callGeminiApi(string $notes, string $apiKey, ?int $categoryId): ?array
    {
        $prompt = <<<EOT
You are an expert Pakistani craft curator for DastKar Hub, an ethical artisanal marketplace.
Synthesize the following artisan craft notes into a structured JSON product listing.
Adhere strictly to authenticity: highlight generational handmade heritage (e.g. Multan, Chiniot, Swat, Hala, Peshawar, Quetta, Lahore), natural materials, and sustainable preservation.
Do NOT invent false certifications or laboratory claims.

Artisan Notes: {$notes}

Respond strictly with valid JSON conforming to this schema:
{
  "title": "Clear, evocative title under 80 characters",
  "description": "Rich 2-3 paragraph cultural storytelling description of craft technique and provenance",
  "materials": "Authentic natural materials used",
  "dimensions": "Standard dimensions (e.g. 10\\\" H x 6\\\" Dia)",
  "care_instructions": "Practical artisanal care guidelines",
  "suggested_price": 3500,
  "tags": ["Handmade", "Heritage", "Craft"],
  "social_caption": "Engaging Instagram/WhatsApp caption with hashtags"
}
EOT;

        $response = Http::timeout(10)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.4,
            ],
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $rawText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($rawText) {
                $decoded = json_decode($rawText, true);
                if (is_array($decoded) && isset($decoded['title'], $decoded['description'])) {
                    $decoded['ai_provider'] = 'gemini-2.5-flash';
                    return $decoded;
                }
            }
        }

        return null;
    }

    /**
     * Resilient Pakistani artisan craft engine (Zero-dependency fallback).
     */
    protected function generateHeuristicListing(string $notes, ?int $categoryId): array
    {
        $lower = strtolower($notes);

        // Detect craft domain
        if (str_contains($lower, 'pottery') || str_contains($lower, 'ceramic') || str_contains($lower, 'kashigari') || str_contains($lower, 'blue') || str_contains($lower, 'vase') || str_contains($lower, 'clay')) {
            return [
                'title' => 'Handcrafted Multani Kashigari Blue Pottery Vessel',
                'description' => "Shaped entirely on traditional hand-turned wheels from indigenous Indus riverbed clay, this piece represents centuries of generational Multani ceramic mastery. Each floral motif is individually hand-painted with natural cobalt oxide pigments before being fired at high temperatures in a wood-fired kiln, yielding the iconic vitreous azure glaze that has adorned South Asian palaces and shrines for over 800 years.\n\nEvery contour bears the subtle touch of the artisan's hand, ensuring that no two vessels are ever identical. Ideal as a striking standalone mantelpiece or functional centerpiece celebrating authentic Pakistani heritage.",
                'materials' => 'Indigenous alluvial clay, natural cobalt oxide glaze, lead-free vitreous mineral slip',
                'dimensions' => '11" Height x 6.5" Diameter (Weight: ~1.2 kg)',
                'care_instructions' => 'Rinse gently with lukewarm water and mild herbal soap. Avoid abrasive scrubbers and microwave usage to protect the hand-glazed cobalt surface.',
                'suggested_price' => 4200,
                'tags' => ['Multani Pottery', 'Kashigari', 'Blue Ceramics', 'Indus Heritage', 'Handmade Vessel'],
                'social_caption' => "Preserving 800 years of Multani craftsmanship. Hand-thrown, cobalt-painted, and kiln-fired by master artisans. #DastKarHub #MultaniPottery #Kashigari #PakistaniCraft #EthicalCommerce",
                'ai_provider' => 'dastkar-craft-engine-v1',
            ];
        }

        if (str_contains($lower, 'ajrak') || str_contains($lower, 'block') || str_contains($lower, 'ralli') || str_contains($lower, 'textile') || str_contains($lower, 'fabric') || str_contains($lower, 'sindh')) {
            return [
                'title' => 'Authentic Sindhi Natural Indigo Hand-Blocked Ajrak Shawl',
                'description' => "Crafted through the ancient 16-stage Sindhi printing ritual, this authentic Ajrak represents a timeless celebration of the Indus civilization. Pure hand-spun cotton is repeatedly soaked in river water, mustard oil, and camel dung solutions before being hand-stamped with hand-carved acacia wood blocks using natural indigo and madder root extracts.\n\nThe geometric celestial patterns—symbolizing the universe, stars, and night sky—are stamped with unerring rhythmic precision. Breathable in high summer and comforting in brisk winter, each shawl takes up to three weeks of artisan dedication.",
                'materials' => '100% handloom organic cotton, natural indigofera tinctoria, wild madder root (Manjishtha)',
                'dimensions' => '90" Length x 42" Width',
                'care_instructions' => 'Dry clean recommended for the first two washes to set organic dyes. Thereafter, gentle hand wash in cold water with mild detergent. Dry in indirect shade.',
                'suggested_price' => 3800,
                'tags' => ['Sindhi Ajrak', 'Hand Block Print', 'Natural Indigo', 'Organic Cotton', 'Artisan Textile'],
                'social_caption' => "16 steps of river-soaked alchemy. Hand-blocked with natural indigo and ancient acacia stamps. Wear living Indus history. #DastKarHub #Ajrak #SindhHeritage #EthicalFashion",
                'ai_provider' => 'dastkar-craft-engine-v1',
            ];
        }

        if (str_contains($lower, 'wood') || str_contains($lower, 'carv') || str_contains($lower, 'chiniot') || str_contains($lower, 'sheesham') || str_contains($lower, 'rosewood') || str_contains($lower, 'table') || str_contains($lower, 'box')) {
            return [
                'title' => 'Hand-Carved Chinioti Rosewood (Sheesham) Heritage Box',
                'description' => "Fashioned from seasoned native Pakistani Dalbergia sissoo (Sheesham), this decorative keepsake box exemplifies the revered woodworking traditions of Chiniot. Master carvers employ fine hand chisels (tanki) to carve intricate floral Arabesque and Jali fretwork patterns directly into the dense, rich grain of the hardwood.\n\nFinished with natural beeswax and linseed oil rubbing to accentuate the golden-brown grain without synthetic lacquers, this heirloom piece offers both utilitarian protection for personal treasures and a physical monument to generational craft.",
                'materials' => '100% seasoned Pakistani Rosewood (Sheesham / Dalbergia sissoo), solid brass hinges, natural beeswax polish',
                'dimensions' => '9.5" Length x 6" Width x 3.5" Height',
                'care_instructions' => 'Wipe periodically with a dry, lint-free microfiber cloth. Nourish wood grain annually with a dab of natural almond or linseed oil.',
                'suggested_price' => 5400,
                'tags' => ['Chiniot Woodcraft', 'Sheesham', 'Rosewood Carving', 'Hand Carved', 'Keepsake Box'],
                'social_caption' => "Chiseled by hand from seasoned Sheesham rosewood in the historic workshops of Chiniot. Built to be passed down through generations. #DastKarHub #ChiniotiWood #Sheesham #PakistaniMakers",
                'ai_provider' => 'dastkar-craft-engine-v1',
            ];
        }

        if (str_contains($lower, 'shawl') || str_contains($lower, 'pashmina') || str_contains($lower, 'swat') || str_contains($lower, 'wool') || str_contains($lower, 'kashmir')) {
            return [
                'title' => 'Handloom Swati Woolen Shawl with Geometric Border Weave',
                'description' => "Woven on wooden pit-looms in the mountain valleys of Swat, this traditional woolen shawl combines highland warmth with refined ethnic aesthetics. The fleece is carefully carded and spun by hand before being interlaced with vibrant geometric motifs along the borders that reflect ancestral Kohistani iconography.\n\nRemarkably lightweight yet deeply insulating, this versatile wrap is designed to accompany you through cool autumn evenings and harsh winter chills with timeless elegance.",
                'materials' => '100% pure mountain highland wool, hand-dyed natural accent yarns',
                'dimensions' => '88" Length x 40" Width',
                'care_instructions' => 'Dry clean only. Store wrapped in breathable cotton casing with natural cedar balls or dried neem leaves to repel moths.',
                'suggested_price' => 6200,
                'tags' => ['Swati Shawl', 'Handloom Wool', 'Mountain Craft', 'Swat Valley', 'Winter Wrap'],
                'social_caption' => "Hand-spun on pit-looms amidst the mountains of Swat. Authentic warmth woven with generational soul. #DastKarHub #SwatShawl #Handloom #HeritageWool",
                'ai_provider' => 'dastkar-craft-engine-v1',
            ];
        }

        if (str_contains($lower, 'leather') || str_contains($lower, 'chappal') || str_contains($lower, 'peshawar') || str_contains($lower, 'shoe') || str_contains($lower, 'sandal')) {
            return [
                'title' => 'Master-Crafted Oxblood Peshawari Chappal (Double Sole)',
                'description' => "Handcrafted in the legendary shoe bazaars of Peshawar, this classical Peshawari chappal represents the pinnacle of traditional Pakistani footwear. Cut from premium full-grain cowhide leather, the upper is meticulously hand-stitched with reinforced nylon-waxed thread and shaped around ergonomic wooden lasts.\n\nThe iconic double-tiered tire sole provides all-weather grip and durable comfort for daily wear, festive gatherings, and formal occasions alike.",
                'materials' => 'Full-grain vegetable-tanned cowhide leather, heavy-duty recycled tire sole, cushioned leather footbed',
                'dimensions' => 'Sizes Available: EU 40 to 45 (UK 6 to 11)',
                'care_instructions' => 'Condition occasionally with neutral leather balm. Clean dust with a soft horsehair brush. Keep away from prolonged moisture.',
                'suggested_price' => 4500,
                'tags' => ['Peshawari Chappal', 'Handmade Leather', 'Double Sole', 'Peshawar Craft', 'Men Traditional'],
                'social_caption' => "Hand-stitched full-grain cowhide from the heritage bazaars of Peshawar. Uncompromising comfort, timeless stride. #DastKarHub #PeshawariChappal #LeatherCraft",
                'ai_provider' => 'dastkar-craft-engine-v1',
            ];
        }

        // Generic authentic artisanal item
        $cleanTitle = ucwords(trim($notes));
        return [
            'title' => "Handcrafted {$cleanTitle} — Artisan Edition",
            'description' => "Carefully hand-shaped and crafted by independent Pakistani makers, this piece honors the living traditions of indigenous craft. Created with thoughtful attention to detail, sustainable raw materials, and time-honored artisanal methods, it delivers authentic quality that cannot be matched by commercial mass manufacturing.\n\nEvery purchase directly supports rural craft families and preserves Pakistan's intangible cultural heritage.",
            'materials' => 'Ethically sourced indigenous materials, natural non-toxic pigments, traditional workshop finishes',
            'dimensions' => 'Standard Artisan Size (Custom dimensions available on request)',
            'care_instructions' => 'Handle with gentle care. Dust regularly with a clean microfiber cloth and keep away from prolonged direct moisture.',
            'suggested_price' => 3200,
            'tags' => ['Artisan Made', 'Pakistani Craft', 'Handmade Heritage', 'Ethical Commerce'],
            'social_caption' => "Handmade with patience, precision, and passion by Pakistan's master artisans. Explore authentic heritage on DastKar Hub. #DastKarHub #PakistaniArtisans #Handmade",
            'ai_provider' => 'dastkar-craft-engine-v1',
        ];
    }
}
