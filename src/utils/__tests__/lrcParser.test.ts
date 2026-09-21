import { describe, it, expect } from 'vitest';
import { parseLrcContent, parseSrtContent, parsePlainText } from '../lrcParser';

describe('lrcParser', () => {
  it('parses standard LRC lines with timestamps and computes outTime correctly', () => {
    const lrc = '[00:01.50]If I scatter like stardust\n[00:05.80]I will still drift forward\n[00:09.30]Tracing a new map';
    const lines = parseLrcContent(lrc);
    expect(lines).toHaveLength(3);
    expect(lines[0].inTime).toBe(1.5);
    expect(lines[0].outTime).toBe(5.8);
    expect(lines[0].original).toBe('If I scatter like stardust');
    expect(lines[1].inTime).toBe(5.8);
    expect(lines[1].outTime).toBe(9.3);
    expect(lines[2].inTime).toBe(9.3);
    expect(lines[2].outTime).toBe(13.3);
  });

  it('handles empty or metadata-only lines gracefully', () => {
    const lrc = '[ti:Sample Title]\n[ar:Artist Name]\n\n[00:02.00]Hello world';
    const lines = parseLrcContent(lrc);
    expect(lines).toHaveLength(1);
    expect(lines[0].original).toBe('Hello world');
  });

  it('parses SRT subtitle format', () => {
    const srt = '1\n00:00:02,500 --> 00:00:06,000\nFirst subtitle line\n\n2\n00:00:07,000 --> 00:00:10,200\nSecond subtitle line';
    const lines = parseSrtContent(srt);
    expect(lines).toHaveLength(2);
    expect(lines[0].inTime).toBe(2.5);
    expect(lines[0].outTime).toBe(6.0);
    expect(lines[0].original).toBe('First subtitle line');
  });

  it('parses plain text into spaced lyric items', () => {
    const text = 'Line one\nLine two\nLine three';
    const lines = parsePlainText(text);
    expect(lines).toHaveLength(3);
    expect(lines[0].inTime).toBe(0);
    expect(lines[1].inTime).toBe(3.5);
    expect(lines[2].inTime).toBe(7.0);
  });
});
