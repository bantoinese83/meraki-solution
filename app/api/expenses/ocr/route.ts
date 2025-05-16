import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

function guessCategory(text: string): string {
  let category = 'Other';
  if (/walmart|grocery|grocer|supermarket/i.test(text)) {
    category = 'Groceries';
  }
  if (/uber|lyft|taxi|transport/i.test(text)) {
    category = 'Transportation';
  }
  if (/restaurant|cafe|coffee|food/i.test(text)) {
    category = 'Meals & Entertainment';
  }
  if (/clothing|shirt|pants|dress|boutique|apparel|jeans|jacket|skirt|sweater/i.test(text)) {
    category = 'Clothing';
  }
  return category;
}

function extractCategoryFromGemini(text: string): string | null {
  // Look for 'Category: <category>' or similar in the Gemini response
  const match = text.match(/Category\s*[:\-]?\s*([A-Za-z &]+)/i);
  if (match) {
    return match[1].trim();
  }
  // Also try to find 'category would be <category>'
  const match2 = text.match(/category would be ([A-Za-z &]+)/i);
  if (match2) {
    return match2[1].trim();
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: file.type || 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Extract the following fields from this receipt image and output as JSON:\n{\n  "merchant": ...,\n  "total": ...,\n  "date": ...,\n  "category": ...,\n  "items": [...]\n}\nIf a field is missing, use null. Also, show the extracted text as markdown below the JSON.`
          }
        ]
      }
    ];

    const result = await model.generateContent({ contents });
    const text = result.response.text() || '';
    let category = extractCategoryFromGemini(text);
    if (!category) {
      category = guessCategory(text);
    }
    return new Response(JSON.stringify({ text, category }), { status: 200 });
  } catch (err) {
    console.error('Gemini OCR error:', err);
    return new Response(JSON.stringify({ error: 'Gemini OCR failed', details: String(err) }), { status: 500 });
  }
} 