export function calculateTaskPoints(task) {
  let points = 0;

  if (task.difficulty === "Easy") points += 10;
  if (task.difficulty === "Medium") points += 20;
  if (task.difficulty === "Hard") points += 40;

  if (task.priority === "High") points += 10;
  if (task.priority === "Critical") points += 15;

  return points;
}

export function calculateDailyBonus(completionRate) {
  if (completionRate === 100) return 100;
  if (completionRate >= 80) return 50;
  return 0;
}
