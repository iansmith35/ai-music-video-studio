// Allow importing CSS files as side-effect imports in TypeScript
declare module "*.css" {
  const styles: { readonly [className: string]: string };
  export default styles;
}
