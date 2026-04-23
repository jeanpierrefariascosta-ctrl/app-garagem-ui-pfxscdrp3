import pb from '@/lib/pocketbase/client'

export const createReview = (data: {
  user: string
  workshop: string
  service_record: string
  rating: number
  comment?: string
}) => {
  return pb.collection('reviews').create(data)
}

export const getUserReviews = (userId: string) => {
  return pb.collection('reviews').getFullList({
    filter: `user = "${userId}"`,
  })
}
