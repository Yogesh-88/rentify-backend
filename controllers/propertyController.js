const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient");
const sendEmail = require("../services/emailService");

const postProperty = async (req, res) => {
  const { location, area, bedrooms, bathrooms, amenities } = req.body;
  if (
    !location ||
    !area ||
    !bedrooms ||
    !bathrooms ||
    !amenities ||
    amenities.length === 0
  ) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "All fields are required" });
  }

  try {
    const property = await prisma.property.create({
      data: {
        location,
        area,
        bedrooms: parseInt(bedrooms, 10),
        bathrooms: parseInt(bathrooms, 10),
        amenities,
        user: { connect: { id: req.user.userId } },
      },
    });
    res.json(property);
  } catch (e) {
    console.error(e);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error creating property" });
  }
};

const getProperties = async (req, res) => {
  const { page = 1, pageSize = 10, ...filters } = req.query;
  const skip = (page - 1) * pageSize;

  const where = {};
  if (filters.noOfRooms) where.bedrooms = parseInt(filters.noOfRooms);
  if (filters.location) where.location = filters.location;

  try {
    const properties = await prisma.property.findMany({
      skip: parseInt(skip),
      take: parseInt(pageSize),
      where,
    });
    res.json(properties);
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error fetching properties" });
  }
};

const getPropertyDetails = async (req, res) => {
  const propertyId = parseInt(req.params.id);
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error fetching property details" });
  }
};

const updateProperty = async (req, res) => {
  const propertyId = parseInt(req.params.id);
  const { location, area, bedrooms, bathrooms, amenities } = req.body;

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.userId !== req.user.userId) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Property not found or unauthorized" });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { location, area, bedrooms, bathrooms, amenities },
    });

    res.json(updatedProperty);
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error updating property" });
  }
};

const deleteProperty = async (req, res) => {
  const propertyId = parseInt(req.params.id);

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.userId !== req.user.userId) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Property not found or unauthorized" });
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.json({ message: "Property deleted successfully" });
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error deleting property" });
  }
};

const likeProperty = async (req, res) => {
  const propertyId = parseInt(req.params.id);

  try {
    const propertyExists = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!propertyExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Property not found" });
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        likes: { increment: 1 },
      },
    });

    res.json(property);
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error liking property" });
  }
};

const showInterest = async (req, res) => {
  const propertyId = parseInt(req.params.id);
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { user: true },
    });
    if (!property) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Property not found" });
    }

    const buyer = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    sendEmail(
      buyer.email,
      "Interested in Property",
      `You showed interest in the property located at ${property.location}. Contact details of the seller:\n Email: ${property.user.email} \n Phone Number:${property.user.phoneNumber} \n Name: ${property.user.firstName}  ${property.user.lastName}}`
    );

    sendEmail(
      property.user.email,
      "Buyer Interested in Your Property",
      `A buyer is interested in your property located at ${property.location}. \n Buyer's  details: ${buyer.firstName} ${buyer.lastName} ${buyer.email} ${buyer.phoneNumber}`
    );

    res.json({ message: "Interest shown and emails sent" });
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error showing interest in property" });
  }
};

const getSellerProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { userId: req.user.userId },
    });
    res.json(properties);
  } catch (e) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Error fetching seller's properties" });
  }
};

module.exports = {
  postProperty,
  getProperties,
  getPropertyDetails,
  updateProperty,
  deleteProperty,
  likeProperty,
  showInterest,
  getSellerProperties,
};
