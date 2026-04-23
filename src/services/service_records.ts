import pb from '@/lib/pocketbase/client'

export const getServiceRecords = (vehicleId: string) => {
  return pb.collection('service_records').getFullList({
    filter: `vehicle = "${vehicleId}"`,
    sort: '-service_date',
    expand: 'workshop',
  })
}

export const updateServiceRecordNF = (id: string, file: File) => {
  const formData = new FormData()
  formData.append('nf_file', file)
  return pb.collection('service_records').update(id, formData)
}
