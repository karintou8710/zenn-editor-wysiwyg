import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import * as helper from '../../lib/helper';
import { getWorkingPath } from '../../lib/helper';
import * as Log from '../../lib/log';
import { validateSlug } from '../../../common/helper';

const fixtureDirPath = path.resolve(__dirname, '..', 'fixtures');

describe('generateSlug() のテスト', () => {
  test('有効な slug を返す', () => {
    const str = helper.generateSlug();
    const result = validateSlug(str);
    expect(result).toBe(true);
  });
});

describe('getCurrentCliVersion() のテスト', () => {
  test('バージョン番号を返す', () => {
    const str = helper.getCurrentCliVersion();
    expect(str).toMatch(/^0\.[0-9.]+/);
  });
});

describe('getWorkingPath() のテスト', () => {
  beforeEach(() => {
    // mock
    vi.spyOn(process, 'cwd').mockReturnValue('foo');
    vi.spyOn(process, 'exit').mockReturnValue(undefined as never);
    vi.spyOn(Log, 'error').mockReturnValue(undefined);
  });

  test('結合されたパスを返す', () => {
    expect(helper.getWorkingPath('bar')).toEqual('foo/bar');
    expect(helper.getWorkingPath('/bar')).toEqual('foo/bar');
  });

  test('ディレクトリトラバーサルを防ぐために "../" が含まれている場合はエラーを出す', () => {
    helper.getWorkingPath('../foo');
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining(`不正な文字列が含まれているため処理を終了します`)
    );
  });
});

describe('getFileRaw() のテスト', () => {
  test('有効なパスの場合はファイル内容を返す', () => {
    const result = helper.getFileRaw(`${fixtureDirPath}/markdown-body-only.md`);
    expect(result).toContain(`# Hello\n\nHola!`);
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.getFileRaw('invalid-path');
    expect(result).toBe(null);
  });
});

describe('getImageRaw() のテスト', () => {
  test('有効なパスの場合は画像のバイナリデータを返す', () => {
    const result = helper.getFileRaw(`${fixtureDirPath}/images/test.jpg`);
    expect(result?.length).toBeGreaterThanOrEqual(500);
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.getFileRaw('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listDirnames() のテスト', () => {
  test('有効なパスの場合はディレクトリ名の配列を返す', () => {
    const result = helper.listDirnames(`${fixtureDirPath}/books`);
    expect(result).toEqual(['my-first-book', 'my-second-book']);
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.listDirnames('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listFilenames() のテスト', () => {
  test('指定したディレクトリ内のファイル名の配列を返す', () => {
    const result = helper.listFilenames(`${fixtureDirPath}/articles`);
    // use sort() to ignore array position
    expect(result?.sort()).toEqual(
      ['my-first-post.md', 'my-second-post.md'].sort()
    );
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.listFilenames('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listFilenamesOrderByModified() のテスト', () => {
  function touchFile(articleFilename: string) {
    const fullpath = path.join(fixtureDirPath, `articles/${articleFilename}`);
    const currentTime = new Date().getTime() / 1000; // The value should be a Unix timestamp in seconds. For example, Date.now() returns milliseconds, so it should be divided by 1000 before passing it in.
    fs.utimesSync(fullpath, currentTime, currentTime);
  }

  test('変更時刻順にファイル名を返す', () => {
    // update my-second-post.md mtime
    touchFile('my-second-post.md');
    expect(
      helper.listFilenamesOrderByModified(`${fixtureDirPath}/articles`)
    ).toEqual(['my-second-post.md', 'my-first-post.md']);
    // touch my-first-post.md metime
    touchFile('my-first-post.md');
    expect(
      helper.listFilenamesOrderByModified(`${fixtureDirPath}/articles`)
    ).toEqual(['my-first-post.md', 'my-second-post.md']);
  });

  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.listFilenamesOrderByModified('invalid-path');
    expect(result).toBe(null);
  });
});

describe('getImageSize() のテスト', () => {
  test('指定した画像のサイズ', () => {
    const result = helper.getImageSize(
      `${fixtureDirPath}/images/test-1036bytes.jpg`
    );
    expect(result).toEqual(1036);
  });
});

describe('generateFileIfNotExist() のテスト', () => {
  const tempFilepath = path.join(process.cwd(), '.temp/test/example.md');
  afterEach(() => {
    // clean up
    fs.rmSync(tempFilepath, {
      force: true,
    });
  });

  test('指定された本文を持つファイルを生成する', () => {
    const body = 'Hello!';
    helper.generateFileIfNotExist(tempFilepath, body);
    const result = fs.readFileSync(tempFilepath, 'utf8');
    expect(result).toEqual(body);
  });

  test('既に存在するファイルを上書きしない', () => {
    helper.generateFileIfNotExist(tempFilepath, 'Hello!');
    // trying to write same file should throw error
    expect(() =>
      helper.generateFileIfNotExist(tempFilepath, 'Updated!')
    ).toThrow(/EEXIST: file already exists/);
    // body shouldn't have been changed
    const result = fs.readFileSync(tempFilepath, 'utf8');
    expect(result).toEqual('Hello!');
  });
});

describe('completeHtml() のテスト', () => {
  beforeEach(() => {
    // process.cwdがfixturesディレクトリを指すようにする
    vi.spyOn(process, 'cwd').mockReturnValue(fixtureDirPath);
  });

  test('src の値が URL なら検証に成功する', () => {
    const html = helper.completeHtml(
      '<img src="https://example.com/images/example.png">'
    );
    expect(html).not.toContain('表示できません');
  });

  test('src の値が有効なパスなら検証に成功する', () => {
    const html = helper.completeHtml('<img src="/images/test.jpg">'); // fixtures/images/test.jpgを参照
    expect(html).not.toContain('表示できません');
  });

  test('src に%20（スペースのURLエンコード）が含まれるパスでも正しく処理される', () => {
    const imagePathWithSpace = path.join(
      fixtureDirPath,
      'images',
      'test image.jpg'
    );
    const originalImagePath = path.join(fixtureDirPath, 'images', 'test.jpg');

    if (fs.existsSync(originalImagePath)) {
      fs.copyFileSync(originalImagePath, imagePathWithSpace);

      const html = helper.completeHtml('<img src="/images/test%20image.jpg">');

      expect(html).not.toContain('ファイルが存在しません');
      expect(html).not.toContain('表示できません');

      // clean up
      fs.unlinkSync(imagePathWithSpace);
    }
  });

  test('src に指定された画像がなければ "ファイルが存在しません" を出力する', () => {
    const html = helper.completeHtml('<img src="/images/notexist.jpg">'); // fixtures/images/notexist.jpgを参照
    expect(html).toContain('ファイルが存在しません');
  });

  test('src の値が無効なパスなら "表示できません" を出力する', () => {
    const html = helper.completeHtml('<img src="../images/example.png">');
    expect(html).toContain('表示できません');
  });

  test('src の値が無効な拡張子なら "表示できません" を出力する', () => {
    const html = helper.completeHtml('<img src="/images/example.svg">');
    expect(html).toContain('表示できません');
  });
});

describe('detectPackageExecutor() のテスト', () => {
  beforeEach(async () => {
    if (fs.existsSync(getWorkingPath('package-lock.json'))) {
      await fs.promises.unlink(getWorkingPath('package-lock.json'));
    }
    if (fs.existsSync(getWorkingPath('yarn.lock'))) {
      await fs.promises.unlink(getWorkingPath('yarn.lock'));
    }
    if (fs.existsSync(getWorkingPath('pnpm-lock.yaml'))) {
      await fs.promises.unlink(getWorkingPath('pnpm-lock.yaml'));
    }
    if (fs.existsSync(getWorkingPath('bun.lockb'))) {
      await fs.promises.unlink(getWorkingPath('bun.lockb'));
    }
  });

  test('package-lock.json が存在する場合は `npx` を返す', async () => {
    const tempFilePath = getWorkingPath('package-lock.json');
    await fs.promises.writeFile(tempFilePath, '');

    const result = helper.detectPackageExecutor();
    expect(result).toEqual('npx');

    await fs.promises.unlink(tempFilePath);
  });

  test('yarn.lock が存在する場合は `yarn` を返す', async () => {
    const tempFilePath = getWorkingPath('yarn.lock');
    await fs.promises.writeFile(tempFilePath, '');

    const result = helper.detectPackageExecutor();
    expect(result).toEqual('yarn');

    await fs.promises.unlink(tempFilePath);
  });

  test('pnpm-lock.yaml が存在する場合は `pnpm` を返す', async () => {
    const tempFilePath = getWorkingPath('pnpm-lock.yaml');
    await fs.promises.writeFile(tempFilePath, '');

    const result = helper.detectPackageExecutor();
    expect(result).toEqual('pnpm');

    await fs.promises.unlink(tempFilePath);
  });

  test('bun.lockb が存在する場合は `bun` を返す', async () => {
    const tempFilePath = getWorkingPath('bun.lockb');
    await fs.promises.writeFile(tempFilePath, '');

    const result = helper.detectPackageExecutor();
    expect(result).toEqual('bun');

    await fs.promises.unlink(tempFilePath);
  });

  test('どのファイルも存在しない場合は `npx` を返す', () => {
    const result = helper.detectPackageExecutor();
    expect(result).toEqual('npx');
  });
});
