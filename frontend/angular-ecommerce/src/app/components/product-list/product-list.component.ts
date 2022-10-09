import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products:Product[]=[];
  currentCategoryId:number=1;
  previousCategoryId: number=1;
  searchMode:boolean=false;

  //new properties for pagination
  thePageNumber:number=1;
  thePageSize:number=5;
  theTotalElements:number=0;

  previousKeyword:string="";

  constructor(private productService:ProductService,
              private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    });
  }
  listProducts() {

      this.searchMode=this.route.snapshot.paramMap.has('keyword');

      if(this.searchMode){
        this.handleSearchProducts();
      }else{
        this.handleListProducts();
      }
  }
  handleSearchProducts() {
    const theKeyword:string=this.route.snapshot.paramMap.get('keyword')!;

    //If we have different keyword than previous
    //then set thePageNumber to 1
    if(this.previousKeyword!=theKeyword){
      this.thePageNumber=1;
    }

    this.previousKeyword=theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
    
    //now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1,
                                               this.thePageSize,
                                               theKeyword).subscribe(this.processResult());
  }

  handleListProducts(){

     //check if 'id' parameter is available
     const hasCategory:boolean=this.route.snapshot.paramMap.has('id');

     if(hasCategory){
       //get the 'id' param in string and add + sign to get as number and ! added in last to tell compiler that the value is not null
       this.currentCategoryId=+this.route.snapshot.paramMap.get('id')!;
     }else{
       //categoryId is not available ....i.e default value is 1;
       this.currentCategoryId=1;
     }

     //check if we have different categoryId than previous
     //Note-Angular will reuse the component if it is currently being viewed
     
     //if we have different category Id than before than set the pageNumber = 1
     if(this.previousCategoryId!=this.currentCategoryId){
       this.thePageNumber=1;
     }
     this.previousCategoryId = this.currentCategoryId;

     console.log(`currentCategoryId=${this.currentCategoryId},thePageNumber=${this.thePageNumber}`);
     //now get the products for the given category Id
    // this.productService.getProductList(this.currentCategoryId).subscribe(
    //    data => {
    //     this.products=data;   })
    this.productService.getProductListPaginate(this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(this.processResult());
  }

  processResult() {
    return (data:any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }
  
  updatePageSize(pageSize:string){
    this.thePageSize=+pageSize;
    this.thePageNumber=1;
    this.listProducts();
  }

  addToCart(theProduct:Product){
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    //TODO real work here ...!!
  }
}
