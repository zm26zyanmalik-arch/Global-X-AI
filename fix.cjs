const fs = require('fs');
const glob = ['src/App.tsx', 'src/screens/HomeScreen.tsx', 'src/screens/ChatScreen.tsx', 'src/screens/StudyScreen.tsx', 'src/screens/PlannerScreen.tsx', 'src/screens/RewardScreen.tsx', 'src/services/geminiService.ts'];

glob.forEach(file => {
  if (fs.existsSync(file)) {
     let content = fs.readFileSync(file, 'utf8');
     content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
     fs.writeFileSync(file, content);
  }
});
