import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MailModule from '../components/mail/MailModule';

describe('MailModule Component', () => {
  it('renders Mail Server SMTP & IMAP flow title', () => {
    render(<MailModule appMode="detailed" />);
    expect(screen.getAllByText(/Mail/i).length).toBeGreaterThan(0);
  });
});
