import { getLanguageName, getStructurePrompt, getContentPrompt } from './wiki';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

// --- getLanguageName tests ---
console.log('\ngetLanguageName:');

assert(getLanguageName('en') === 'English', 'en → English');
assert(getLanguageName('kr') === 'Korean (한국어)', 'kr → Korean (한국어) — not 한国語');
assert(getLanguageName('ja') === 'Japanese (日本語)', 'ja → Japanese');
assert(getLanguageName('zh') === 'Mandarin Chinese (中文)', 'zh → Mandarin Chinese');
assert(getLanguageName('zh-tw') === 'Traditional Chinese (繁體中文)', 'zh-tw → Traditional Chinese');
assert(getLanguageName('es') === 'Spanish (Español)', 'es → Spanish');
assert(getLanguageName('vi') === 'Vietnamese (Tiếng Việt)', 'vi → Vietnamese');
assert(getLanguageName('pt-br') === 'Brazilian Portuguese (Português Brasileiro)', 'pt-br → Brazilian Portuguese');
assert(getLanguageName('fr') === 'Français (French)', 'fr → French');
assert(getLanguageName('ru') === 'Русский (Russian)', 'ru → Russian');
assert(getLanguageName('xx') === 'English', 'unknown → defaults to English');
assert(!getLanguageName('kr').includes('国'), 'kr does NOT contain Chinese character 国');

// --- getStructurePrompt tests ---
console.log('\ngetStructurePrompt:');

const structureKr = getStructurePrompt({
  language: 'kr',
  isComprehensiveView: true,
  fileTree: 'src/\n  index.ts',
  readme: '# Test Project',
});

assert(structureKr.includes('Korean (한국어)'), 'Korean structure prompt contains correct language name');
assert(structureKr.includes('Korean Style Guide'), 'Korean structure prompt includes style guide');
assert(structureKr.includes('영한 혼용 규칙'), 'Korean style guide has bilingual rule');
assert(structureKr.includes('경어체'), 'Korean style guide has formality rule');
assert(structureKr.includes('20-35'), 'Comprehensive mode requests 20-35 pages');
assert(structureKr.includes('src/\n  index.ts'), 'Structure prompt includes file tree');
assert(structureKr.includes('# Test Project'), 'Structure prompt includes readme');

const structureEn = getStructurePrompt({
  language: 'en',
  isComprehensiveView: false,
  fileTree: 'src/',
  readme: '# Hello',
});

assert(structureEn.includes('English'), 'English structure prompt contains English');
assert(!structureEn.includes('Korean Style Guide'), 'English structure prompt has no Korean style guide');
assert(structureEn.includes('8-12'), 'Concise mode requests 8-12 pages');
assert(!structureEn.includes('Core Components'), 'Concise mode omits comprehensive sections');

const structureEnComprehensive = getStructurePrompt({
  language: 'en',
  isComprehensiveView: true,
  fileTree: '',
  readme: '',
});
assert(structureEnComprehensive.includes('Core Components'), 'Comprehensive mode includes Core Components');

// --- getContentPrompt tests ---
console.log('\ngetContentPrompt:');

const contentKr = getContentPrompt({
  language: 'kr',
  pageTitle: '시스템 아키텍처',
  filePathsWithUrls: '- [src/index.ts](https://github.com/test/repo/blob/main/src/index.ts)',
});

assert(contentKr.includes('Korean (한국어)'), 'Korean content prompt contains correct language name');
assert(contentKr.includes('Korean Style Guide'), 'Korean content prompt includes style guide');
assert(contentKr.includes('시스템 아키텍처'), 'Content prompt includes page title');
assert(contentKr.includes('src/index.ts'), 'Content prompt includes file paths');

const contentEn = getContentPrompt({
  language: 'en',
  pageTitle: 'System Architecture',
  filePathsWithUrls: '- [src/main.ts](url)',
});

assert(contentEn.includes('English'), 'English content prompt contains English');
assert(!contentEn.includes('Korean Style Guide'), 'English content prompt has no Korean style guide');
assert(contentEn.includes('System Architecture'), 'Content prompt includes page title');

// Empty inputs
const structureEmpty = getStructurePrompt({
  language: 'en',
  isComprehensiveView: true,
  fileTree: '',
  readme: '',
});
assert(structureEmpty.includes('<file_tree>'), 'Structure prompt works with empty file tree');

const contentEmpty = getContentPrompt({
  language: 'en',
  pageTitle: '',
  filePathsWithUrls: '',
});
assert(contentEmpty.includes('expert technical writer'), 'Content prompt works with empty inputs');

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
