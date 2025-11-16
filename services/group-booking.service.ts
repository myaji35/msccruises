import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GroupBookingRequest {
  cruiseId: string;
  groupLeaderId: string;
  groupName?: string;
  groupLeaderEmail: string;
  groupLeaderPhone?: string;
  cabins: CabinRequest[];
  notes?: string;
}

export interface CabinRequest {
  cabinCategory: string;
  numPassengers: number;
  passengers?: PassengerRequest[];
}

export interface PassengerRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  passportNumber?: string;
  nationality: string;
  isPrimary?: boolean;
}

/**
 * GroupBookingService
 * Handles group bookings (3+ cabins) with automatic group discounts
 */
export class GroupBookingService {
  /**
   * Calculate group discount based on number of cabins
   */
  calculateGroupDiscount(numCabins: number): number {
    if (numCabins >= 16) return null; // Sales team contact required
    if (numCabins >= 11) return 0.15; // 15%
    if (numCabins >= 6) return 0.10; // 10%
    if (numCabins >= 3) return 0.05; // 5%
    return 0;
  }

  /**
   * Create a new group booking
   */
  async createGroupBooking(request: GroupBookingRequest) {
    const { cruiseId, groupLeaderId, groupName, cabins, groupLeaderEmail, groupLeaderPhone, notes } = request;

    // Validate minimum cabins
    if (cabins.length < 3) {
      throw new Error('Minimum 3 cabins required for group booking');
    }

    // Check if requires sales team (16+ cabins)
    if (cabins.length >= 16) {
      return this.createSalesInquiry(request);
    }

    // Get cruise info for pricing
    const cruise = await prisma.cruise.findUnique({
      where: { id: cruiseId },
    });

    if (!cruise) {
      throw new Error('Cruise not found');
    }

    // Calculate pricing
    const cabinPrices = cabins.map((cabin) => {
      const categoryMultipliers: Record<string, number> = {
        inside: 1.0,
        oceanview: 1.3,
        balcony: 1.8,
        suite: 3.0,
      };
      const multiplier = categoryMultipliers[cabin.cabinCategory] || 1.0;
      return cruise.startingPrice * multiplier;
    });

    const baseTotal = cabinPrices.reduce((sum, price) => sum + price, 0);
    const discountPercentage = this.calculateGroupDiscount(cabins.length);
    const discountAmount = baseTotal * discountPercentage;
    const finalTotal = baseTotal - discountAmount;
    const totalPassengers = cabins.reduce((sum, cabin) => sum + cabin.numPassengers, 0);

    // Create group booking in transaction
    const groupBooking = await prisma.$transaction(async (tx) => {
      // 1. Create group booking record
      const group = await tx.groupBooking.create({
        data: {
          cruiseId,
          groupLeaderId,
          groupName,
          numCabins: cabins.length,
          totalPassengers,
          discountPercentage,
          baseTotal,
          discountAmount,
          finalTotal,
          groupLeaderEmail,
          groupLeaderPhone,
          notes,
          status: 'pending',
          paymentStatus: 'pending',
        },
      });

      // 2. Create individual bookings for each cabin
      for (let i = 0; i < cabins.length; i++) {
        const cabin = cabins[i];
        const cabinPrice = cabinPrices[i];
        const discountedPrice = cabinPrice * (1 - discountPercentage);

        const booking = await tx.booking.create({
          data: {
            userId: groupLeaderId,
            bookingNumber: `GRP-${group.id.slice(0, 8)}-${i + 1}`,
            cruiseId,
            cruiseName: cruise.name,
            shipName: cruise.shipName,
            departureDate: new Date(), // Should come from cruise schedule
            returnDate: new Date(), // Should come from cruise schedule
            departurePort: cruise.departurePort,
            cabinCategory: cabin.cabinCategory,
            totalPrice: discountedPrice,
            status: 'pending',
            paymentStatus: 'pending',
            groupBookingId: group.id,
            isGroupLeader: i === 0, // First cabin is leader's cabin
          },
        });

        // 3. Add passengers if provided
        if (cabin.passengers && cabin.passengers.length > 0) {
          for (const passenger of cabin.passengers) {
            await tx.passenger.create({
              data: {
                bookingId: booking.id,
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                dateOfBirth: passenger.dateOfBirth,
                passportNumber: passenger.passportNumber,
                nationality: passenger.nationality,
                isPrimary: passenger.isPrimary || false,
              },
            });
          }
        }
      }

      return group;
    });

    return groupBooking;
  }

  /**
   * Create sales inquiry for large groups (16+ cabins)
   */
  private async createSalesInquiry(request: GroupBookingRequest) {
    // In production, this would:
    // 1. Send email to sales team
    // 2. Create inquiry record
    // 3. Notify group leader

    console.log('Sales inquiry created for large group:', {
      cabins: request.cabins.length,
      groupLeader: request.groupLeaderEmail,
    });

    return {
      requiresSalesContact: true,
      numCabins: request.cabins.length,
      message: 'Your group requires special pricing. Our sales team will contact you within 24 hours.',
    };
  }

  /**
   * Add a cabin to existing group booking
   */
  async addCabinToGroup(groupId: string, cabin: CabinRequest, userId: string) {
    const group = await prisma.groupBooking.findUnique({
      where: { id: groupId },
      include: { bookings: true },
    });

    if (!group) {
      throw new Error('Group booking not found');
    }

    // Check if can still modify (e.g., 90 days before departure)
    // Add validation logic here

    const cruise = await prisma.cruise.findUnique({
      where: { id: group.cruiseId },
    });

    // Calculate new pricing
    const newNumCabins = group.numCabins + 1;
    const newDiscount = this.calculateGroupDiscount(newNumCabins);

    const categoryMultipliers: Record<string, number> = {
      inside: 1.0,
      oceanview: 1.3,
      balcony: 1.8,
      suite: 3.0,
    };
    const multiplier = categoryMultipliers[cabin.cabinCategory] || 1.0;
    const cabinPrice = cruise!.startingPrice * multiplier;

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Recalculate total pricing
      const newBaseTotal = group.baseTotal + cabinPrice;
      const newDiscountAmount = newBaseTotal * newDiscount;
      const newFinalTotal = newBaseTotal - newDiscountAmount;

      // Update group booking
      await tx.groupBooking.update({
        where: { id: groupId },
        data: {
          numCabins: newNumCabins,
          totalPassengers: group.totalPassengers + cabin.numPassengers,
          discountPercentage: newDiscount,
          baseTotal: newBaseTotal,
          discountAmount: newDiscountAmount,
          finalTotal: newFinalTotal,
        },
      });

      // Create new booking
      await tx.booking.create({
        data: {
          userId,
          bookingNumber: `GRP-${groupId.slice(0, 8)}-${newNumCabins}`,
          cruiseId: group.cruiseId,
          cruiseName: cruise!.name,
          shipName: cruise!.shipName,
          departureDate: new Date(),
          returnDate: new Date(),
          departurePort: cruise!.departurePort,
          cabinCategory: cabin.cabinCategory,
          totalPrice: cabinPrice * (1 - newDiscount),
          status: 'pending',
          paymentStatus: 'pending',
          groupBookingId: groupId,
        },
      });

      // If discount tier changed, update all existing bookings
      if (newDiscount !== group.discountPercentage) {
        for (const booking of group.bookings) {
          const originalPrice = booking.totalPrice / (1 - group.discountPercentage);
          const newPrice = originalPrice * (1 - newDiscount);

          await tx.booking.update({
            where: { id: booking.id },
            data: { totalPrice: newPrice },
          });
        }
      }
    });
  }

  /**
   * Remove a cabin from group booking
   */
  async removeCabinFromGroup(groupId: string, bookingId: string) {
    const group = await prisma.groupBooking.findUnique({
      where: { id: groupId },
      include: { bookings: true },
    });

    if (!group) {
      throw new Error('Group booking not found');
    }

    if (group.numCabins <= 3) {
      throw new Error('Cannot remove cabin. Minimum 3 cabins required for group booking.');
    }

    const booking = group.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found in group');
    }

    // Calculate new pricing
    const newNumCabins = group.numCabins - 1;
    const newDiscount = this.calculateGroupDiscount(newNumCabins);

    await prisma.$transaction(async (tx) => {
      // Remove booking
      await tx.booking.delete({ where: { id: bookingId } });

      // Recalculate pricing
      const newBaseTotal = group.baseTotal - (booking.totalPrice / (1 - group.discountPercentage));
      const newDiscountAmount = newBaseTotal * newDiscount;
      const newFinalTotal = newBaseTotal - newDiscountAmount;

      // Update group
      await tx.groupBooking.update({
        where: { id: groupId },
        data: {
          numCabins: newNumCabins,
          discountPercentage: newDiscount,
          baseTotal: newBaseTotal,
          discountAmount: newDiscountAmount,
          finalTotal: newFinalTotal,
        },
      });

      // If discount changed, update remaining bookings
      if (newDiscount !== group.discountPercentage) {
        const remainingBookings = group.bookings.filter((b) => b.id !== bookingId);
        for (const b of remainingBookings) {
          const originalPrice = b.totalPrice / (1 - group.discountPercentage);
          const newPrice = originalPrice * (1 - newDiscount);

          await tx.booking.update({
            where: { id: b.id },
            data: { totalPrice: newPrice },
          });
        }
      }
    });
  }

  /**
   * Get group booking details
   */
  async getGroupBooking(groupId: string) {
    return prisma.groupBooking.findUnique({
      where: { id: groupId },
      include: {
        bookings: {
          include: {
            passengers: true,
          },
        },
      },
    });
  }

  /**
   * Get all group bookings for a user
   */
  async getUserGroupBookings(userId: string) {
    return prisma.groupBooking.findMany({
      where: { groupLeaderId: userId },
      include: {
        bookings: {
          include: {
            passengers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Export singleton
export const groupBookingService = new GroupBookingService();
