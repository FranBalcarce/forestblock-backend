import { sendInquiryMail } from "../utils/mailer.js";

export const getPlanInquiry = async (req, res) => {
  try {
    await sendInquiryMail(req.body);

    return res.status(200).json({
      message:
        "Consulta recibida y enviada correctamente. Te contactaremos a la brevedad.",
    });
  } catch (error) {
    console.error(
      "Error fetching plan inquiry:",
      error?.response?.data || error,
    );
    return res.status(500).json({ message: "Error fetching plan inquiry." });
  }
};
