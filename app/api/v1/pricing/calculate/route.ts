import { NextRequest, NextResponse } from 'next/server';
import { pricingEngine } from '@/services/pricing-engine.service';
import type { PriceParams } from '@/types/pricing.types';

/**
 * POST /api/v1/pricing/calculate
 *
 * Calculate dynamic pricing for a cruise booking
 *
 * Request Body:
 * {
 *   "cruiseId": "string",
 *   "cabinCategory": "inside" | "oceanview" | "balcony" | "suite",
 *   "numCabins": number (optional, default: 1),
 *   "promoCode": "string" (optional),
 *   "departureDate": "ISO date string" (optional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "finalPrice": number,
 *     "currency": "USD",
 *     "breakdown": {
 *       "base": number,
 *       "inventoryAdjustment": number,
 *       "demandAdjustment": number,
 *       "promotionDiscount": number,
 *       "groupDiscount": number
 *     },
 *     "appliedRules": string[]
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.cruiseId || !body.cabinCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: cruiseId, cabinCategory',
        },
        { status: 400 }
      );
    }

    // Validate cabin category
    const validCategories = ['inside', 'oceanview', 'balcony', 'suite'];
    if (!validCategories.includes(body.cabinCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid cabin category. Must be one of: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Build price params
    const params: PriceParams = {
      cruiseId: body.cruiseId,
      cabinCategory: body.cabinCategory,
      numCabins: body.numCabins || 1,
      promoCode: body.promoCode,
      departureDate: body.departureDate ? new Date(body.departureDate) : undefined,
    };

    // Calculate price
    const price = await pricingEngine.calculatePrice(params);

    return NextResponse.json({
      success: true,
      data: price,
    });
  } catch (error: any) {
    console.error('Pricing calculation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate price',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/pricing/calculate
 *
 * Calculate pricing via query parameters (for simple use cases)
 *
 * Query Params:
 * - cruiseId: string (required)
 * - cabinCategory: string (required)
 * - numCabins: number (optional)
 * - promoCode: string (optional)
 * - departureDate: ISO date string (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const cruiseId = searchParams.get('cruiseId');
    const cabinCategory = searchParams.get('cabinCategory');

    if (!cruiseId || !cabinCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: cruiseId, cabinCategory',
        },
        { status: 400 }
      );
    }

    const params: PriceParams = {
      cruiseId,
      cabinCategory,
      numCabins: searchParams.get('numCabins')
        ? parseInt(searchParams.get('numCabins')!)
        : 1,
      promoCode: searchParams.get('promoCode') || undefined,
      departureDate: searchParams.get('departureDate')
        ? new Date(searchParams.get('departureDate')!)
        : undefined,
    };

    const price = await pricingEngine.calculatePrice(params);

    return NextResponse.json({
      success: true,
      data: price,
    });
  } catch (error: any) {
    console.error('Pricing calculation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate price',
      },
      { status: 500 }
    );
  }
}
