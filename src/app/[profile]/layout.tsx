import React from 'react';

// This is a special layout that applies ONLY to your public profile pages.
// Because it just passes its children through, it stops the main
// header and footer from being added to these pages.
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}