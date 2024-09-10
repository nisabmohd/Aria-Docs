
import React from 'react';

const components = [

  {
    name: 'anchor',
    description: 'This is the documentation for the anchor component.',
    usage: `import { anchor } from 'path-to-anchor';
<anchor />`,
  },

  {
    name: 'copy',
    description: 'This is the documentation for the copy component.',
    usage: `import { copy } from 'path-to-copy';
<copy />`,
  },

  {
    name: 'docs-breadcrumb',
    description: 'This is the documentation for the docs-breadcrumb component.',
    usage: `import { docs-breadcrumb } from 'path-to-docs-breadcrumb';
<docs-breadcrumb />`,
  },

  {
    name: 'docs-menu',
    description: 'This is the documentation for the docs-menu component.',
    usage: `import { docs-menu } from 'path-to-docs-menu';
<docs-menu />`,
  },

  {
    name: 'footer',
    description: 'This is the documentation for the footer component.',
    usage: `import { footer } from 'path-to-footer';
<footer />`,
  },

  {
    name: 'leftbar',
    description: 'This is the documentation for the leftbar component.',
    usage: `import { leftbar } from 'path-to-leftbar';
<leftbar />`,
  },

  {
    name: 'navbar',
    description: 'This is the documentation for the navbar component.',
    usage: `import { navbar } from 'path-to-navbar';
<navbar />`,
  },

  {
    name: 'note',
    description: 'This is the documentation for the note component.',
    usage: `import { note } from 'path-to-note';
<note />`,
  },

  {
    name: 'pagination',
    description: 'This is the documentation for the pagination component.',
    usage: `import { pagination } from 'path-to-pagination';
<pagination />`,
  },

  {
    name: 'pre',
    description: 'This is the documentation for the pre component.',
    usage: `import { pre } from 'path-to-pre';
<pre />`,
  },

  {
    name: 'search',
    description: 'This is the documentation for the search component.',
    usage: `import { search } from 'path-to-search';
<search />`,
  },

  {
    name: 'sublink',
    description: 'This is the documentation for the sublink component.',
    usage: `import { sublink } from 'path-to-sublink';
<sublink />`,
  },

  {
    name: 'theme-provider',
    description: 'This is the documentation for the theme-provider component.',
    usage: `import { theme-provider } from 'path-to-theme-provider';
<theme-provider />`,
  },

  {
    name: 'theme-toggle',
    description: 'This is the documentation for the theme-toggle component.',
    usage: `import { theme-toggle } from 'path-to-theme-toggle';
<theme-toggle />`,
  },

  {
    name: 'toc',
    description: 'This is the documentation for the toc component.',
    usage: `import { toc } from 'path-to-toc';
<toc />`,
  },

  {
    name: 'toc-observer',
    description: 'This is the documentation for the toc-observer component.',
    usage: `import { toc-observer } from 'path-to-toc-observer';
<toc-observer />`,
  },

  {
    name: 'typography',
    description: 'This is the documentation for the typography component.',
    usage: `import { typography } from 'path-to-typography';
<typography />`,
  },

  {
    name: 'accordion',
    description: 'This is the documentation for the accordion component.',
    usage: `import { accordion } from 'path-to-accordion';
<accordion />`,
  },

  {
    name: 'avatar',
    description: 'This is the documentation for the avatar component.',
    usage: `import { avatar } from 'path-to-avatar';
<avatar />`,
  },

  {
    name: 'breadcrumb',
    description: 'This is the documentation for the breadcrumb component.',
    usage: `import { breadcrumb } from 'path-to-breadcrumb';
<breadcrumb />`,
  },

  {
    name: 'button',
    description: 'This is the documentation for the button component.',
    usage: `import { button } from 'path-to-button';
<button />`,
  },

  {
    name: 'collapsible',
    description: 'This is the documentation for the collapsible component.',
    usage: `import { collapsible } from 'path-to-collapsible';
<collapsible />`,
  },

  {
    name: 'dialog',
    description: 'This is the documentation for the dialog component.',
    usage: `import { dialog } from 'path-to-dialog';
<dialog />`,
  },

  {
    name: 'dropdown-menu',
    description: 'This is the documentation for the dropdown-menu component.',
    usage: `import { dropdown-menu } from 'path-to-dropdown-menu';
<dropdown-menu />`,
  },

  {
    name: 'input',
    description: 'This is the documentation for the input component.',
    usage: `import { input } from 'path-to-input';
<input />`,
  },

  {
    name: 'scroll-area',
    description: 'This is the documentation for the scroll-area component.',
    usage: `import { scroll-area } from 'path-to-scroll-area';
<scroll-area />`,
  },

  {
    name: 'sheet',
    description: 'This is the documentation for the sheet component.',
    usage: `import { sheet } from 'path-to-sheet';
<sheet />`,
  },

  {
    name: 'stepper',
    description: 'This is the documentation for the stepper component.',
    usage: `import { stepper } from 'path-to-stepper';
<stepper />`,
  },

  {
    name: 'table',
    description: 'This is the documentation for the table component.',
    usage: `import { table } from 'path-to-table';
<table />`,
  },

  {
    name: 'tabs',
    description: 'This is the documentation for the tabs component.',
    usage: `import { tabs } from 'path-to-tabs';
<tabs />`,
  },

];

const ComponentsPage = () => {
  return (
    <div>
      <h1>Custom Components Documentation</h1>
      {components.map((component) => (
        <div key={component.name}>
          <h2>{component.name}</h2>
          <p>{component.description}</p>
          <pre>{component.usage}</pre>
        </div>
      ))}
    </div>
  );
};

export default ComponentsPage;
