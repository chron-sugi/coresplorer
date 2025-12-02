// Debug file - disabled due to missing dependencies
// import { parseSPL, tokenizeSPL } from './index';
/*
const spl = `index=main
| eval response_bucket = case(
    duration<0.1, "fast",
    duration<0.5, "normal",
    true(), "slow"
)`;

console.log('=== TOKENS ===');
const tokens = tokenizeSPL(spl);
console.log(tokens.map(t => `${t.type}:${t.image}`).join(' '));

console.log('\n=== PARSE RESULT ===');
const result = parseSPL(spl);
console.log('Success:', result.success);
console.log('Lex errors:', result.lexErrors.length);
console.log('Parse errors:', result.parseErrors.length);

if (result.lexErrors.length > 0) {
  console.log('\nLex errors:');
  result.lexErrors.forEach(e => console.log(' -', e.message));
}

if (result.parseErrors.length > 0) {
  console.log('\nParse errors:');
  result.parseErrors.forEach(e => {
    console.log(' -', e.message);
    if (e.token) {
      console.log('   at:', e.token.image, 'line:', e.token.startLine, 'col:', e.token.startColumn);
    }
  });
}

console.log('\nAST stages:', result.ast?.stages?.length ?? 'null');

if (result.ast?.stages[1]) {
  const cmd = result.ast.stages[1] as any;
  console.log('\n=== STAGE 1 ===');
  console.log('Type:', cmd.type);
  console.log('Location:', cmd.location);

  if (cmd.type === 'StatsCommand') {
    console.log('Aggregations:', cmd.aggregations?.length);
    cmd.aggregations?.forEach((agg: any, i: number) => {
      console.log(`  [${i}] function:`, agg.function);
      console.log(`      alias:`, agg.alias);
      console.log(`      location:`, agg.location);
    });
    console.log('byFields:', cmd.byFields);
  } else if (cmd.type === 'EvalCommand') {
    console.log('Assignments:', cmd.assignments?.length);
    cmd.assignments?.forEach((assign: any, i: number) => {
      console.log(`  [${i}] targetField:`, assign.targetField);
      console.log(`      dependsOn:`, assign.dependsOn);
      console.log(`      location:`, assign.location);
    });
  }
}

// Show all stages
console.log('\n=== ALL STAGES ===');
result.ast?.stages.forEach((stage: any, i: number) => {
  console.log(`[${i}] ${stage.type} @ line ${stage.location?.startLine}, col ${stage.location?.startColumn}`);
});
*/
