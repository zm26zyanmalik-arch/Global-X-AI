export interface StudySessionLog {
  userId: string;
  subjectId: string;
  durationSeconds: number;
  createdAt: any;
}

// Simulate sessions for local-only analytics since Firebase is removed
export const logStudySession = async (userId: string, subjectId: string, durationSeconds: number) => {
  console.log(`Logged ${durationSeconds}s for ${subjectId}`);
};

export const getStudySessions = async (userId: string) => {
  // Return some fake session data for the graph
  const today = new Date();
  const sessions: StudySessionLog[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    sessions.push({
      userId,
      subjectId: 'Maths',
      durationSeconds: Math.floor(Math.random() * 3600), // up to 60 mins
      createdAt: { toDate: () => d }
    });
  }
  return sessions;
};
