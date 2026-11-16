import prisma from '../../utils/prisma'
import { Application } from '../../types'

export const admissionService = {
  async getAllAdmissions() {
    return await prisma.admissions.findMany({
      orderBy: { created_at: 'desc' }
    })
  },

  async getAdmissionById(id: string | number) {
    return await prisma.admissions.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id) : id }
    })
  },

  async createAdmission(data: Partial<Application>) {
    return await prisma.admissions.create({
      data: {
        name: data.name || '',
        whatsapp: data.whatsapp || '',
        stream: data.stream || '',
        place: data.place || '',
        district: data.district || '',
        state: data.state || '',
        level: data.level || ''
      }
    })
  },

  async updateAdmission(id: string | number, data: Partial<Application>) {
    return await prisma.admissions.update({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
      data: data as any
    })
  },

  async deleteAdmission(id: string | number) {
    return await prisma.admissions.delete({
      where: { id: typeof id === 'string' ? parseInt(id) : id }
    })
  }
}
