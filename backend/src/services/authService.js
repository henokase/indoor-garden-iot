import { Settings } from "../models/Settings.js";
import bcryptjs from "bcryptjs";

export const authService = {
  async login(password) {
    const settings = await Settings.findOne()

    if (!settings?.password) {
      return false
    }

    const isMatch = await bcryptjs.compare(password, settings.password)
    
    return isMatch
  }
}