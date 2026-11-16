import prisma from '../../utils/prisma'
import { ContactItem } from '../../types'

export const contactService = {
  async getAllContacts() {
    return await prisma.contacts.findMany({
      orderBy: { created_at: 'desc' }
    })
  },

  async createContact(data: ContactItem) {
    return await prisma.contacts.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'unread'
      }
    })
  },

  async updateContactStatus(id: string | number, status: 'unread' | 'read') {
    return await prisma.contacts.update({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
      data: { status }
    })
  },

  async deleteContact(id: string | number) {
    return await prisma.contacts.delete({
      where: { id: typeof id === 'string' ? parseInt(id) : id }
    })
  }
}
