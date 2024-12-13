import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { InsertTransactionDto, MarkAsPaidDto, QueryTransactionDto } from './dto';

@ApiTags('Transaction')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
    constructor(private transactionService: TransactionService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryTransactionDto, @Req() { user }: any) {
        return this.transactionService.findAll(query, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string, @Req() { user }: any) {
        return this.transactionService.findOne(+id, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    create(@Body() data: InsertTransactionDto, @Req() { user }: any) {
        return this.transactionService.create(data, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('mark-as-paid/:id')
    markAsPaid(@Param('id') id: string, @Body() data: MarkAsPaidDto, @Req() { user }: any) {
        if (user.role === 'Admin') {
            return this.transactionService.markAsPaid(+id, data, user);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        return this.transactionService.delete(+id, user);
    }
}
